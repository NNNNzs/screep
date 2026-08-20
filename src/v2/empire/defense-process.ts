import type { Process } from "../core/process";
import type { TickContext } from "../core/tick-context";

export class DefenseProcess implements Process {
  run(_context: TickContext): void {
    for (const room of Object.values(Game.rooms)) {
      if (!room.controller?.my) continue;

      const hostiles = room.find(FIND_HOSTILE_CREEPS);
      const injured = room.find(FIND_MY_CREEPS, { filter: creep => creep.hits < creep.hitsMax });
      const towers = room.find(FIND_MY_STRUCTURES, {
        filter: structure => structure.structureType === STRUCTURE_TOWER,
      }) as StructureTower[];

      for (const tower of towers) {
        if (hostiles.length > 0) tower.attack(hostiles[0]);
        else if (injured.length > 0) tower.heal(injured[0]);
      }
    }
  }
}
