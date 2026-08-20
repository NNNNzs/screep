import type { Process } from "../../core/process";
import type { TickContext } from "../../core/tick-context";
import { getRoomMemory } from "../../memory/store";

function positionOf(object: RoomObject): { x: number; y: number } {
  return { x: object.pos.x, y: object.pos.y };
}

export class RoomObserverProcess implements Process {
  run(_context: TickContext): void {
    for (const room of Object.values(Game.rooms)) {
      if (!room.controller?.my) continue;

      const memory = getRoomMemory(room.name);
      const sources = room.find(FIND_SOURCES);
      const containers = room.find(FIND_STRUCTURES, {
        filter: structure => structure.structureType === STRUCTURE_CONTAINER,
      }) as StructureContainer[];
      const findContainer = (source: Source): string | undefined => {
        const nearby = source.pos.findInRange(containers, 2);
        return nearby[0]?.id;
      };

      memory.lastObserved = Game.time;
      memory.controllerId = room.controller.id;
      memory.controllerLevel = room.controller.level;
      memory.sourceIds = sources.map(source => source.id);
      memory.sources = Object.fromEntries(
        sources.map(source => [
          source.id,
          {
            id: source.id,
            ...positionOf(source),
            containerId: findContainer(source),
          },
        ]),
      );

      const mineral = room.find(FIND_MINERALS)[0];
      memory.mineralId = mineral?.id;
      memory.spawnIds = room.find(FIND_MY_SPAWNS).map(spawn => spawn.id);
      memory.towerIds = (room.find(FIND_MY_STRUCTURES, {
        filter: structure => structure.structureType === STRUCTURE_TOWER,
      }) as StructureTower[]).map(tower => tower.id);
      memory.storageId = room.storage?.id;
      memory.terminalId = room.terminal?.id;

      const hostiles = room.find(FIND_HOSTILE_CREEPS);
      memory.threat.hostileCount = hostiles.length;
      if (hostiles.length > 0) memory.threat.lastDetected = Game.time;
    }
  }
}
