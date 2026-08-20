export const CURRENT_SCHEMA_VERSION = 3 as const;

export function createDefaultBotMemory(): BotMemory {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    initializedAt: Game.time,
    kernel: { lastTick: Game.time, processes: {} },
    empire: { ownedRooms: [], lastRefresh: Game.time },
    settings: { enabled: true },
  };
}

export function createDefaultColonyMemory(roomName: string): ColonyMemory {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    roomName,
    lastObserved: 0,
    controllerLevel: 0,
    sourceIds: [],
    sources: {},
    spawnIds: [],
    towerIds: [],
    linkIds: [],
    threat: { hostileCount: 0, lastDetected: 0 },
    requests: {},
  };
}

export function createCreepMemory(
  role: BotRole,
  homeRoom: string,
  sourceId?: string,
  harvestPosition?: { x: number; y: number },
): BotCreepMemory {
  return { schemaVersion: CURRENT_SCHEMA_VERSION, role, homeRoom, bornAt: Game.time, sourceId, harvestPosition };
}

export function isBotCreepMemory(memory: CreepMemory): memory is BotCreepMemory {
  return (
    memory.schemaVersion === CURRENT_SCHEMA_VERSION &&
    (memory.role === "pioneer" || memory.role === "miner" || memory.role === "hauler" || memory.role === "worker") &&
    typeof memory.homeRoom === "string"
  );
}
