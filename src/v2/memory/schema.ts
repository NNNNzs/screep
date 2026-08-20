export const CURRENT_SCHEMA_VERSION = 2 as const;

export function createDefaultBotMemory(): BotMemory {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    initializedAt: Game.time,
    kernel: {
      lastTick: Game.time,
      processes: {},
    },
    empire: {
      ownedRooms: [],
      lastRefresh: Game.time,
    },
    settings: {
      enabled: true,
    },
  };
}

export function createDefaultRoomMemory(roomName: string): V2RoomMemory {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    roomName,
    lastObserved: 0,
    controllerLevel: 0,
    sourceIds: [],
    sources: {},
    spawnIds: [],
    towerIds: [],
    threat: {
      hostileCount: 0,
      lastDetected: 0,
    },
    requests: {},
  };
}

export function createV2CreepMemory(role: V2Role, homeRoom: string, sourceId?: string): V2CreepMemory {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    role,
    homeRoom,
    bornAt: Game.time,
    action: sourceId
      ? {
          kind: "harvest",
          sourceId,
          startedAt: Game.time,
        }
      : undefined,
  };
}

export function isV2CreepMemory(memory: CreepMemory): memory is V2CreepMemory {
  return (
    memory.schemaVersion === CURRENT_SCHEMA_VERSION &&
    (memory.role === "harvester" || memory.role === "worker" || memory.role === "carrier") &&
    typeof memory.homeRoom === "string"
  );
}
