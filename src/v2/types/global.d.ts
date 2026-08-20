export {};

declare global {
type V2Role = "harvester" | "worker" | "carrier";
type V2ActionKind = "harvest" | "withdraw" | "transfer" | "build" | "repair" | "upgrade" | "wait";

interface V2ActionMemory {
  kind: V2ActionKind;
  targetId?: string;
  sourceId?: string;
  resourceType?: ResourceConstant;
  startedAt: number;
}

interface V2RequestMemory {
  id: string;
  kind: "withdraw" | "transfer" | "refill" | "build" | "repair" | "upgrade";
  roomName: string;
  sourceId?: string;
  targetId?: string;
  resourceType?: ResourceConstant;
  amount: number;
  priority: number;
  createdAt: number;
  expiresAt?: number;
  assignedCreeps: string[];
}

interface V2SourceMemory {
  id: string;
  x: number;
  y: number;
  containerId?: string;
}

interface V2RoomMemory {
  schemaVersion: 2;
  roomName: string;
  lastObserved: number;
  controllerId?: string;
  controllerLevel: number;
  sourceIds: string[];
  sources: Record<string, V2SourceMemory>;
  mineralId?: string;
  spawnIds: string[];
  towerIds: string[];
  storageId?: string;
  terminalId?: string;
  threat: {
    hostileCount: number;
    lastDetected: number;
  };
  requests: Record<string, V2RequestMemory>;
}

interface V2ProcessStats {
  runs: number;
  skipped: number;
  cpu: number;
  lastRun?: number;
  lastError?: string;
}

interface BotMemory {
  schemaVersion: 2;
  initializedAt: number;
  kernel: {
    lastTick: number;
    processes: Record<string, V2ProcessStats>;
    lastError?: string;
  };
  empire: {
    ownedRooms: string[];
    lastRefresh: number;
  };
  settings: {
    enabled: boolean;
  };
}

interface V2CreepMemory {
  schemaVersion: 2;
  role: V2Role;
  homeRoom: string;
  bornAt: number;
  action?: V2ActionMemory;
}

  interface Memory {
    lastModified?: string;
    bot?: BotMemory;
  }

  interface RoomMemory extends V2RoomMemory {}

  interface CreepMemory {
    schemaVersion?: number;
    role?: V2Role;
    homeRoom?: string;
    bornAt?: number;
    action?: V2ActionMemory;
  }
}
