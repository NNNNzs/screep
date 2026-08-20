import type { Process } from "../core/process";
import type { TickContext } from "../core/tick-context";
import type { RoomSnapshot, StoreSnapshot } from "./room-snapshot";
import { findHarvestPositions } from "./harvest-slots";

function energyOf(structure: AnyStoreStructure): number {
  return structure.store.getUsedCapacity(RESOURCE_ENERGY) ?? 0;
}

function snapshotRoom(room: Room): RoomSnapshot {
  const containers = room.find(FIND_STRUCTURES, {
    filter: structure => structure.structureType === STRUCTURE_CONTAINER,
  }) as StructureContainer[];
  const links = room.find(FIND_MY_STRUCTURES, {
    filter: structure => structure.structureType === STRUCTURE_LINK,
  }) as StructureLink[];
  const stores = room.find(FIND_STRUCTURES, {
    filter: structure => "store" in structure,
  }) as AnyStoreStructure[];

  const storeSnapshots: StoreSnapshot[] = stores.map(structure => ({
    id: structure.id,
    structureType: structure.structureType,
    x: structure.pos.x,
    y: structure.pos.y,
    energy: energyOf(structure),
    freeCapacity: structure.store.getFreeCapacity(RESOURCE_ENERGY) ?? 0,
  }));

  return {
    roomName: room.name,
    controllerId: room.controller?.id,
    controllerLevel: room.controller?.level ?? 0,
    controllerTicksToDowngrade: room.controller?.ticksToDowngrade,
    sources: room.find(FIND_SOURCES).map(source => ({
      id: source.id,
      x: source.pos.x,
      y: source.pos.y,
      energy: source.energy,
      energyCapacity: source.energyCapacity,
      containerId: source.pos.findInRange(containers, 1)[0]?.id,
      linkId: source.pos.findInRange(links, 2)[0]?.id,
      harvestPositions: findHarvestPositions(room, source),
    })),
    stores: storeSnapshots,
    constructionSites: room.find(FIND_MY_CONSTRUCTION_SITES).map(site => ({
      id: site.id,
      x: site.pos.x,
      y: site.pos.y,
      progress: site.progress,
      progressTotal: site.progressTotal,
      structureType: site.structureType,
    })),
    damagedStructureIds: room.find(FIND_STRUCTURES, {
      filter: structure => structure.hits < structure.hitsMax && structure.structureType !== STRUCTURE_WALL,
    }).map(structure => structure.id),
    hostileCount: room.find(FIND_HOSTILE_CREEPS).length,
    injuredCreepIds: room.find(FIND_MY_CREEPS, { filter: creep => creep.hits < creep.hitsMax }).map(creep => creep.id),
  };
}

export class RoomObserverProcess implements Process {
  run(context: TickContext): void {
    const snapshots = new Map<string, RoomSnapshot>();
    const ownedRooms = Object.values(Game.rooms)
      .filter(room => room.controller?.my)
      .sort((left, right) => left.name.localeCompare(right.name));

    for (const room of ownedRooms) {
      const snapshot = snapshotRoom(room);
      snapshots.set(room.name, snapshot);
      const memory = context.colony(room.name);
      memory.lastObserved = Game.time;
      memory.controllerId = snapshot.controllerId;
      memory.controllerLevel = snapshot.controllerLevel;
      memory.sourceIds = snapshot.sources.map(source => source.id);
      memory.sources = Object.fromEntries(snapshot.sources.map(source => [source.id, {
        id: source.id,
        x: source.x,
        y: source.y,
        containerId: source.containerId,
        linkId: source.linkId,
      }]));
      memory.spawnIds = snapshot.stores.filter(store => store.structureType === STRUCTURE_SPAWN).map(store => store.id);
      memory.towerIds = snapshot.stores.filter(store => store.structureType === STRUCTURE_TOWER).map(store => store.id);
      memory.storageId = snapshot.stores.find(store => store.structureType === STRUCTURE_STORAGE)?.id;
      memory.linkIds = snapshot.stores.filter(store => store.structureType === STRUCTURE_LINK).map(store => store.id);
      memory.threat.hostileCount = snapshot.hostileCount;
      if (snapshot.hostileCount > 0) memory.threat.lastDetected = Game.time;
    }

    context.botMemory.empire.ownedRooms = ownedRooms.map(room => room.name);
    context.botMemory.empire.lastRefresh = Game.time;
    context.replaceSnapshots(snapshots);
  }
}
