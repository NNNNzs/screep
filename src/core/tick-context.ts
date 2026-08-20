import type { Scheduler } from "./scheduler";
import { getColonyMemory } from "../memory/store";
import type { RoomSnapshot } from "../world/room-snapshot";

export interface TickContext {
  readonly tick: number;
  readonly botMemory: BotMemory;
  readonly scheduler: Scheduler;
  readonly snapshots: ReadonlyMap<string, RoomSnapshot>;
  colony(roomName: string): ColonyMemory;
  snapshot(roomName: string): RoomSnapshot | undefined;
  replaceSnapshots(snapshots: Map<string, RoomSnapshot>): void;
}

export function createTickContext(botMemory: BotMemory, scheduler: Scheduler): TickContext {
  let snapshots = new Map<string, RoomSnapshot>();
  return {
    tick: Game.time,
    botMemory,
    scheduler,
    get snapshots() { return snapshots; },
    colony: getColonyMemory,
    snapshot: roomName => snapshots.get(roomName),
    replaceSnapshots: next => { snapshots = next; },
  };
}
