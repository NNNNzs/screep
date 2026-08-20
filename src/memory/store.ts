import { BUILD_ID } from "../runtime/build";
import { createDefaultBotMemory, createDefaultColonyMemory, CURRENT_SCHEMA_VERSION } from "./schema";

export function ensureBotMemory(): BotMemory {
  Memory.lastModified = BUILD_ID;
  if (!Memory.bot || Memory.bot.schemaVersion !== CURRENT_SCHEMA_VERSION) Memory.bot = createDefaultBotMemory();
  Memory.bot.kernel.lastTick = Game.time;
  return Memory.bot;
}

export function getColonyMemory(roomName: string): ColonyMemory {
  if (!Memory.rooms) Memory.rooms = {};
  const current = Memory.rooms[roomName];
  if (!current || current.schemaVersion !== CURRENT_SCHEMA_VERSION || current.roomName !== roomName) {
    Memory.rooms[roomName] = createDefaultColonyMemory(roomName);
  }
  return Memory.rooms[roomName];
}

export function cleanupDeadCreepMemory(): void {
  for (const name of Object.keys(Memory.creeps || {})) if (!Game.creeps[name]) delete Memory.creeps[name];
}

export function pruneRequests(memory: ColonyMemory): void {
  for (const [id, request] of Object.entries(memory.requests)) {
    request.assignedCreeps = request.assignedCreeps.filter(name => Game.creeps[name]?.memory.action?.requestId === id);
    if (request.expiresAt < Game.time || request.amount <= 0) delete memory.requests[id];
  }
}

export function upsertRequest(memory: ColonyMemory, request: RoomRequestMemory): void {
  const previous = memory.requests[request.id];
  memory.requests[request.id] = {
    ...request,
    createdAt: previous?.createdAt ?? request.createdAt,
    assignedCreeps: previous?.assignedCreeps.filter(name => Game.creeps[name]) ?? [],
  };
}

export function releaseRequest(creep: Creep): void {
  const requestId = creep.memory.action?.requestId;
  if (!requestId || !creep.memory.homeRoom) return;
  const request = getColonyMemory(creep.memory.homeRoom).requests[requestId];
  if (request) request.assignedCreeps = request.assignedCreeps.filter(name => name !== creep.name);
}
