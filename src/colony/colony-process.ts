import type { Process } from "../core/process";
import type { TickContext } from "../core/tick-context";
import { pruneRequests, upsertRequest } from "../memory/store";
import { findHarvestPositions } from "../world/harvest-slots";
import type { RoomSnapshot } from "../world/room-snapshot";

const REQUEST_TTL = 3;

function upsert(memory: ColonyMemory, request: Omit<RoomRequestMemory, "createdAt" | "expiresAt" | "assignedCreeps">): void {
  upsertRequest(memory, {
    ...request,
    createdAt: Game.time,
    expiresAt: Game.time + REQUEST_TTL,
    assignedCreeps: [],
  });
}

function containerSiteExists(snapshot: RoomSnapshot, source: RoomSnapshot["sources"][number]): boolean {
  return snapshot.constructionSites.some(site =>
    site.structureType === STRUCTURE_CONTAINER && Math.max(Math.abs(site.x - source.x), Math.abs(site.y - source.y)) <= 1,
  );
}

function chooseContainerPosition(room: Room, source: Source): RoomPosition | undefined {
  const candidates = findHarvestPositions(room, source).map(position => new RoomPosition(position.x, position.y, room.name));
  const spawn = room.find(FIND_MY_SPAWNS)[0];
  if (!spawn) return candidates.sort((left, right) => left.x - right.x || left.y - right.y)[0];

  const costs = new PathFinder.CostMatrix();
  for (const structure of room.find(FIND_STRUCTURES)) {
    if (structure.structureType === STRUCTURE_ROAD || structure.structureType === STRUCTURE_CONTAINER) continue;
    if (structure.structureType === STRUCTURE_RAMPART && (structure as StructureRampart).my) continue;
    costs.set(structure.pos.x, structure.pos.y, 0xff);
  }
  for (const roomSource of room.find(FIND_SOURCES)) costs.set(roomSource.pos.x, roomSource.pos.y, 0xff);

  const reachable = candidates
    .map(position => ({
      position,
      result: PathFinder.search(position, { pos: spawn.pos, range: 1 }, {
        maxRooms: 1,
        maxOps: 500,
        roomCallback: roomName => roomName === room.name ? costs : false,
      }),
    }))
    .filter(candidate => !candidate.result.incomplete);
  return reachable
    .sort((left, right) => left.result.cost - right.result.cost || left.position.x - right.position.x || left.position.y - right.position.y)[0]?.position
    ?? candidates.sort((left, right) => left.x - right.x || left.y - right.y)[0];
}

export class ColonyProcess implements Process {
  run(context: TickContext): void {
    for (const snapshot of context.snapshots.values()) {
      const room = Game.rooms[snapshot.roomName];
      if (!room?.controller?.my) continue;
      const memory = context.colony(room.name);
      pruneRequests(memory);
      this.ensureSourceContainers(room, snapshot);
      this.planRefills(snapshot, memory);
      this.planWork(snapshot, memory);
    }
  }

  private ensureSourceContainers(room: Room, snapshot: RoomSnapshot): void {
    const controller = room.controller;
    if (!controller || (CONTROLLER_STRUCTURES[STRUCTURE_CONTAINER][controller.level] ?? 0) <= 0) return;
    const containerCount = snapshot.sources.filter(source => source.containerId).length;
    const allowed = CONTROLLER_STRUCTURES[STRUCTURE_CONTAINER][controller.level] ?? 0;
    if (containerCount >= allowed) return;

    for (const sourceSnapshot of snapshot.sources) {
      if (sourceSnapshot.containerId || containerSiteExists(snapshot, sourceSnapshot)) continue;
      const source = Game.getObjectById(sourceSnapshot.id as Id<Source>);
      const position = source ? chooseContainerPosition(room, source) : undefined;
      if (position) room.createConstructionSite(position, STRUCTURE_CONTAINER);
      return;
    }
  }

  private planRefills(snapshot: RoomSnapshot, memory: ColonyMemory): void {
    for (const store of snapshot.stores) {
      if (store.freeCapacity <= 0) continue;
      const priority = store.structureType === STRUCTURE_SPAWN ? 100
        : store.structureType === STRUCTURE_EXTENSION ? 95
          : store.structureType === STRUCTURE_TOWER ? (snapshot.hostileCount > 0 ? 110 : 80)
            : 0;
      if (priority === 0) continue;
      upsert(memory, {
        id: `refill:${store.id}`,
        kind: "refill",
        roomName: snapshot.roomName,
        targetId: store.id,
        amount: store.freeCapacity,
        priority,
      });
    }
  }

  private planWork(snapshot: RoomSnapshot, memory: ColonyMemory): void {
    for (const site of snapshot.constructionSites) {
      upsert(memory, {
        id: `build:${site.id}`,
        kind: "build",
        roomName: snapshot.roomName,
        targetId: site.id,
        amount: site.progressTotal - site.progress,
        priority: site.structureType === STRUCTURE_CONTAINER ? 90 : 50,
      });
    }
    for (const id of snapshot.damagedStructureIds.slice(0, 5)) {
      upsert(memory, {
        id: `repair:${id}`,
        kind: "repair",
        roomName: snapshot.roomName,
        targetId: id,
        amount: 1,
        priority: 40,
      });
    }
    if (snapshot.controllerId) {
      const emergencyUpgrade = snapshot.controllerTicksToDowngrade !== undefined && snapshot.controllerTicksToDowngrade < 5000;
      upsert(memory, {
        id: `upgrade:${snapshot.controllerId}`,
        kind: "upgrade",
        roomName: snapshot.roomName,
        targetId: snapshot.controllerId,
        amount: 1,
        priority: emergencyUpgrade ? 125 : 10,
      });
    }
  }
}
