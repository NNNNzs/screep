import { createDefaultBotMemory, createDefaultRoomMemory, CURRENT_SCHEMA_VERSION } from "./schema";
import { BUILD_ID } from "../runtime/build";

export function ensureBotMemory(): BotMemory {
  Memory.lastModified = BUILD_ID;

  if (!Memory.bot || Memory.bot.schemaVersion !== CURRENT_SCHEMA_VERSION) {
    Memory.bot = createDefaultBotMemory();
  }

  Memory.bot.kernel.lastTick = Game.time;
  return Memory.bot;
}

export function getRoomMemory(roomName: string): V2RoomMemory {
  if (!Memory.rooms) Memory.rooms = {};

  const current = Memory.rooms[roomName];
  if (!current || current.schemaVersion !== CURRENT_SCHEMA_VERSION || current.roomName !== roomName) {
    Memory.rooms[roomName] = createDefaultRoomMemory(roomName);
  }

  return Memory.rooms[roomName];
}

export function cleanupDeadCreepMemory(): void {
  for (const name of Object.keys(Memory.creeps || {})) {
    if (!Game.creeps[name]) delete Memory.creeps[name];
  }
}

export function pruneExpiredRequests(room: V2RoomMemory): void {
  for (const [id, request] of Object.entries(room.requests)) {
    if (request.expiresAt !== undefined && request.expiresAt < Game.time) {
      delete room.requests[id];
    }
  }
}
