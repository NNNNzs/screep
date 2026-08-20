import type { Process } from "../core/process";
import type { TickContext } from "../core/tick-context";

export class EmpireProcess implements Process {
  run(context: TickContext): void {
    const ownedRooms = Object.values(Game.rooms)
      .filter(room => room.controller?.my)
      .map(room => room.name)
      .sort();

    context.botMemory.empire.ownedRooms = ownedRooms;
    context.botMemory.empire.lastRefresh = Game.time;

    for (const roomName of ownedRooms) context.room(roomName);
  }
}
