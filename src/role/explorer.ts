
export const isMaxControllerRooms = () => {
  // 判断当前控制的房间数量是否达到上限
  const controllerLevelRooms = Object.keys(Game.rooms).filter(roomName => Game.rooms[roomName].controller?.my);
  return controllerLevelRooms.length >= Game.gcl.level;
}

/** 判断当前 */
const run = function (creep: Creep) {

  if (creep.memory.toRoom) {
    creep.moveTo(creep.memory.toRoom);
    return;
  }

  // 找到房间的出口
  // 找到房间的出口
  const exits = creep.room.find(FIND_EXIT);
  if (exits.length === 0) return;
  const exit = exits[Math.floor(Math.random() * exits.length)];


  creep.memory.fromRoom = creep.room.name;
  creep.memory.toRoom = exit.roomName;


}

export default {
  run(creep: Creep) {
    // run(creep)
  }
}