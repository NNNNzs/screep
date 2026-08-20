import type { Scheduler } from "./scheduler";
import { getRoomMemory } from "../memory/store";

export interface TickContext {
  readonly tick: number;
  readonly botMemory: BotMemory;
  readonly scheduler: Scheduler;
  room(roomName: string): V2RoomMemory;
}

export function createTickContext(botMemory: BotMemory, scheduler: Scheduler): TickContext {
  return {
    tick: Game.time,
    botMemory,
    scheduler,
    room: getRoomMemory,
  };
}
