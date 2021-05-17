
const unHealList = [STRUCTURE_WALL, STRUCTURE_RAMPART, 'extension'];
const defaultRoom = Game.spawns['Spawn1'];

export const toFixedList = (pos: AnyStructure = defaultRoom) => {

  const toFixedStructures = pos.room.find(FIND_MY_STRUCTURES, {
    filter: (structure) => structure.hits + 200 < structure.hitsMax && !unHealList.includes(structure.structureType)
  })
  
  Memory.toFixedStructures = toFixedStructures;

}

export const toKillList = (pos: RoomPosition = defaultRoom.pos) => {

  const closestHostile = pos.findClosestByRange(FIND_HOSTILE_CREEPS);

  Memory.toKillList = closestHostile;

}


export const roomScanner = () => {
  toFixedList()
}