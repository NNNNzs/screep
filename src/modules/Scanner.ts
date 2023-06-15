
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
  toFixedStructures.sort((a, b) => a.hits / a.hitsMax > b.hits / b.hitsMax ? 1 : -1);
  Memory.toFixedStructures = toFixedStructures;

  Memory.rooms[pos.room.name].toFixedStructures = toFixedStructures;

}

export const toBuildList = (room: Room = defaultRoom.room) => {
  const list = room.find(FIND_CONSTRUCTION_SITES);
  Memory.toConstructionSite = list;

  /** 带建造列表 */
  Memory.rooms[room.name].toConstructionSite = list;

}

export const setToKillList = (pos: RoomPosition = defaultRoom.pos) => {

  const closestHostile = pos.findClosestByRange(FIND_HOSTILE_CREEPS);

  Memory.toKillList = closestHostile;

}



export const roomScanner = () => {
  toFixedList();
  setToKillList();
  toBuildList();
}