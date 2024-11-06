import { generateAdjacentRoomName } from "../utils/room";
import { log } from "../utils";

interface GraphNode {
  roomName: string;
  visited: boolean;
  exits: RoomPosition[];
};

//  构建一个图，每个房间的出口，然后每个房间的出口都连通
class Graph {
  nodes: { [key: string]: RoomPosition[] } = {};
}

/** 判断当前控制的房间数量是否达到上限 */
export const isMaxControllerRooms = () => {
  const controllerLevelRooms = Object.keys(Game.rooms).filter(roomName => Game.rooms[roomName].controller?.my);
  return controllerLevelRooms.length >= Game.gcl.level;
}
/** 判断出口方向实在当前房间的 上下还是左右 */
export const getExitDirection = (exit: RoomPosition, room: Room) => {
  // 如果 x 是0左边
  // 如果 x 是49 右边
  // 如果 y 是0 上边
  // 如果 y 是49 下边
  if (exit.x === 0) {
    return 'W';
  }
  if (exit.x === 49) {
    return 'E';
  }
  if (exit.y === 0) {
    return 'N';
  }
  if (exit.y === 49) {
    return 'S';
  }
}

/** 判断当前 */
const run = function (creep: Creep) {
  return ;

  log.error('role/explorer', 'run', 'in nextRoomName', creep.room.name, creep.memory.nextRoomName);
  if (creep.room.name === creep.memory.nextRoomName) {
    creep.memory.moveTo = null;
    creep.memory.nextRoomName = null;
  }

  if (creep.memory.moveTo) {
    // log.warn('role/explorer', 'run', 'moveTo', creep.room.name, creep.memory.moveTo);

    // 移动到下一个房间
    const p = new RoomPosition(creep.memory.moveTo.x, creep.memory.moveTo.y, creep.memory.moveTo.roomName);
    const res = creep.moveTo(p);
    if (res !== OK) {
      // log.info('role/explorer', 'moveTo', res, p);
    }
    return;
    // 
  }

  // 找到房间的出口
  const exits = creep.room.find(FIND_EXIT);

  const adjacentRoomMap = new Map<string, RoomPosition[]>();

  exits.forEach(exit => {
    const direction = getExitDirection(exit, creep.room);
    const adjacentRoomName = generateAdjacentRoomName(creep.room.name, direction);
    if (!adjacentRoomMap.has(adjacentRoomName)) {
      adjacentRoomMap.set(adjacentRoomName, []);
    }
    adjacentRoomMap.get(adjacentRoomName)?.push(exit);
  });

  let nextRoomName;

  adjacentRoomMap.forEach((exits, roomName) => {
    const visited = Memory.rooms[roomName];
    if (!visited) {
      nextRoomName = roomName;
      creep.memory.nextRoomName = nextRoomName;
      // 找到 exits 中距离当前房间最近的出口
      const exit = exits.reduce((prev, current) => {
        return creep.pos.getRangeTo(prev) < creep.pos.getRangeTo(current) ? prev : current;
      });
      creep.memory.moveTo = exit;
    }
  });

  // 如果下一个房间没有找到，则随机选择一个房间
  if (!nextRoomName) {
    log.warn('role/explorer', 'no nextRoomName', creep.room.name);
    nextRoomName = Object.keys(Game.rooms)[Math.floor(Math.random() * Object.keys(Game.rooms).length)];

    creep.memory.nextRoomName = nextRoomName;
    const exit = exits.reduce((prev, current) => {
      return creep.pos.getRangeTo(prev) < creep.pos.getRangeTo(current) ? prev : current;
    });
    creep.memory.moveTo = exit;
  }

  log.warn('role/explorer', 'run', creep.room.name, creep.memory.nextRoomName);



  // creep.memory.fromRoom = creep.room.name;
  // creep.memory.toRoom = exit.roomName;


}

export default {
  run,
}