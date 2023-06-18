
const unHealList = [STRUCTURE_WALL, STRUCTURE_RAMPART, 'extension'];
const defaultRoom = Game.spawns['Spawn1'];

const setRoomsMemory = <K extends keyof RoomMemory>(roomName: string, key: K, value: RoomMemory[K]) => {
  // if (!Memory.rooms) Memory.rooms = {};
  // if (!Memory.rooms[roomName]) Memory.rooms[roomName] = {};
  // Object.defineProperty(Memory.rooms[roomName], key, value)
  // Memory.rooms[roomName]
}

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

  global.toFixedStructures = toFixedStructures;

  // const roomName = pos.room.name;

  // setRoomsMemory(roomName, 'toFixedStructures', toFixedStructures)

}

export const toBuildList = (room: Room = defaultRoom.room) => {
  const list = room.find(FIND_CONSTRUCTION_SITES);
  global.toConstructionSite = list;

  // const roomName = room.name;

  /** 带建造列表 */
  // setRoomsMemory(roomName, 'toConstructionSite', list)
  // setRoomsMemory(roomName, 'aaaa', '2323')

}



export const roomScanner = () => {

  toFixedList();
  toBuildList();
}