export {};

declare global {
  type BotRole = "pioneer" | "miner" | "hauler" | "worker";
  type BotActionKind = "harvest" | "withdraw" | "transfer" | "build" | "repair" | "upgrade" | "wait";
  type RequestKind = "refill" | "build" | "repair" | "upgrade";

  interface BotActionMemory {
    kind: BotActionKind;
    targetId?: string;
    sourceId?: string;
    requestId?: string;
    startedAt: number;
  }

  interface RoomRequestMemory {
    id: string;
    kind: RequestKind;
    roomName: string;
    targetId: string;
    amount: number;
    priority: number;
    createdAt: number;
    expiresAt: number;
    assignedCreeps: string[];
  }

  interface SourceMemory {
    id: string;
    x: number;
    y: number;
    containerId?: string;
    linkId?: string;
  }

  interface ColonyMemory {
    schemaVersion: 3;
    roomName: string;
    lastObserved: number;
    controllerId?: string;
    controllerLevel: number;
    sourceIds: string[];
    sources: Record<string, SourceMemory>;
    spawnIds: string[];
    towerIds: string[];
    storageId?: string;
    linkIds: string[];
    threat: { hostileCount: number; lastDetected: number };
    requests: Record<string, RoomRequestMemory>;
  }

  interface ProcessStats {
    runs: number;
    skipped: number;
    cpu: number;
    lastRun?: number;
    lastError?: string;
  }

  interface BotMemory {
    schemaVersion: 3;
    initializedAt: number;
    kernel: { lastTick: number; processes: Record<string, ProcessStats>; lastError?: string };
    empire: { ownedRooms: string[]; lastRefresh: number };
    settings: { enabled: boolean };
  }

  interface BotCreepMemory {
    schemaVersion: 3;
    role: BotRole;
    homeRoom: string;
    bornAt: number;
    sourceId?: string;
    harvestPosition?: { x: number; y: number };
    action?: BotActionMemory;
  }

  interface Memory { lastModified?: string; bot?: BotMemory; }
  interface RoomMemory extends ColonyMemory {}
  interface CreepMemory {
    schemaVersion?: number;
    role?: BotRole;
    homeRoom?: string;
    bornAt?: number;
    sourceId?: string;
    harvestPosition?: { x: number; y: number };
    action?: BotActionMemory;
  }
}
