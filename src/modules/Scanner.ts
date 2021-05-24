
const unHealList = [STRUCTURE_WALL, STRUCTURE_RAMPART, 'extension'];
const defaultRoom = Game.spawns['Spawn1'];

export const toFixedList = (pos: AnyStructure = defaultRoom) => {
  // 不修墙
  const toFixedStructures = pos.room.find(FIND_STRUCTURES, {
    filter: object => {
      // 
      const undo = unHealList.includes(object.structureType);

      return object.hits < object.hitsMax && !undo
    }
  });
  toFixedStructures.sort((a, b) => a.hits / a.hitsMax - b.hits / b.hits);

  Memory.toFixedStructures = toFixedStructures;

}

export const toKillList = (pos: RoomPosition = defaultRoom.pos) => {

  const closestHostile = pos.findClosestByRange(FIND_HOSTILE_CREEPS);

  Memory.toKillList = closestHostile;

}


export const roomScanner = () => {
  toFixedList()
}