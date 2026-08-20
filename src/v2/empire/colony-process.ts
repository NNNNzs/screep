import type { Process } from "../core/process";
import type { TickContext } from "../core/tick-context";
import { pruneExpiredRequests } from "../memory/store";

function addRequest(room: V2RoomMemory, request: V2RequestMemory): void {
  const existing = room.requests[request.id];
  room.requests[request.id] = existing
    ? { ...existing, amount: request.amount, priority: request.priority, expiresAt: request.expiresAt }
    : request;
}

export class ColonyProcess implements Process {
  run(context: TickContext): void {
    for (const roomName of context.botMemory.empire.ownedRooms) {
      const room = Game.rooms[roomName];
      if (!room?.controller?.my) continue;

      const memory = context.room(roomName);
      pruneExpiredRequests(memory);
      this.planEnergyRequests(room, memory);
      this.planConstruction(room, memory);
      this.planUpgrade(room, memory);
    }
  }

  private planEnergyRequests(room: Room, memory: V2RoomMemory): void {
    const targets = room.find(FIND_MY_STRUCTURES, {
      filter: structure =>
        (structure.structureType === STRUCTURE_SPAWN ||
          structure.structureType === STRUCTURE_EXTENSION ||
          structure.structureType === STRUCTURE_TOWER) &&
        (structure as AnyStoreStructure).store.getFreeCapacity(RESOURCE_ENERGY) > 0,
    }) as Array<StructureSpawn | StructureExtension | StructureTower>;

    for (const target of targets) {
      addRequest(memory, {
        id: `refill:${target.id}`,
        kind: "refill",
        roomName: room.name,
        targetId: target.id,
        resourceType: RESOURCE_ENERGY,
        amount: target.store.getFreeCapacity(RESOURCE_ENERGY),
        priority: target.structureType === STRUCTURE_TOWER ? 80 : 100,
        createdAt: Game.time,
        expiresAt: Game.time + 20,
        assignedCreeps: memory.requests[`refill:${target.id}`]?.assignedCreeps ?? [],
      });
    }
  }

  private planConstruction(room: Room, memory: V2RoomMemory): void {
    for (const site of room.find(FIND_CONSTRUCTION_SITES).slice(0, 5)) {
      addRequest(memory, {
        id: `build:${site.id}`,
        kind: "build",
        roomName: room.name,
        targetId: site.id,
        amount: site.progressTotal - site.progress,
        priority: 50,
        createdAt: Game.time,
        expiresAt: Game.time + 100,
        assignedCreeps: memory.requests[`build:${site.id}`]?.assignedCreeps ?? [],
      });
    }
  }

  private planUpgrade(room: Room, memory: V2RoomMemory): void {
    if (!room.controller) return;
    addRequest(memory, {
      id: `upgrade:${room.controller.id}`,
      kind: "upgrade",
      roomName: room.name,
      targetId: room.controller.id,
      amount: 100,
      priority: 10,
      createdAt: Game.time,
      expiresAt: Game.time + 10,
      assignedCreeps: memory.requests[`upgrade:${room.controller.id}`]?.assignedCreeps ?? [],
    });
  }
}
