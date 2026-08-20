import type { Process } from "../core/process";
import type { TickContext } from "../core/tick-context";

export class DefenseProcess implements Process {
  run(context: TickContext): void {
    for (const snapshot of context.snapshots.values()) {
      const room = Game.rooms[snapshot.roomName];
      if (!room) continue;
      const towers = room.find(FIND_MY_STRUCTURES, {
        filter: structure => structure.structureType === STRUCTURE_TOWER,
      }) as StructureTower[];
      if (towers.length === 0) continue;

      const hostile = room.find(FIND_HOSTILE_CREEPS)[0];
      const injured = hostile ? undefined : room.find(FIND_MY_CREEPS, { filter: creep => creep.hits < creep.hitsMax })[0];
      for (const tower of towers) {
        if (hostile) tower.attack(hostile);
        else if (injured) tower.heal(injured);
      }
    }
  }
}
