const unHealList = [STRUCTURE_WALL, STRUCTURE_RAMPART, 'extension'];
const defaultRoom = Game.spawns['Spawn1'];

/**
 * 
 * @param source 
 * @param spawn 
 * @description 找到建设source container最佳的建筑位置
 * @returns 
 */
function findBestContainerPosition(source: Source, spawn: StructureSpawn) {
  let possiblePositions: RoomPosition[] = [];

  const terrain = new Room.Terrain(spawn.pos.roomName);

  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      const newX = source.pos.x + x;
      const newY = source.pos.y + y;
      if (newX < 0 || newY < 0 || newX > 49 || newY > 49) continue
      if (terrain.get(newX, newY) === TERRAIN_MASK_WALL) continue
      const pos = new RoomPosition(newX, newY, source.pos.roomName);
      possiblePositions.push(pos);
    }
  }
  const positions = possiblePositions;
  let bestDistance = Infinity;
  let bestPositions: RoomPosition;
  // 找到最近的位置
  for (let pos of positions) {
    let distance = pos.getRangeTo(spawn);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestPositions = pos
    }
  }
  return bestPositions;
}

export const findSpawns = () => {
  for (const key in Game.spawns) {

    const room = Game.spawns[key].room;
    const roomName = room.name;

    if (!Memory.rooms) {
      Memory.rooms = {};
    }

    // 找到资源点附近可以放container的位置
    if (!Memory.rooms[roomName]) {
      Memory.rooms[roomName] = {
        maxWorker: 4,
        toFixedStructures: [],
        toConstructionSite: [],
        containerIdList: [],
        sourcesList: [],
        controlId: null
      };
    }

    if (Memory.rooms[roomName].sourcesList.length === 0) {
      // 找到资源点
      const sources = room.find(FIND_SOURCES);
      // 初始化container点的数据
      Memory.rooms[roomName].sourcesList = sources.map(s => {
        return {
          id: s.id,
          containerId: null,
          containerPos: null
        }
      });
    }

    Memory.rooms[roomName].sourcesList.forEach((s, index) => {
      // 没有containerId 和containerPos

      if (!s.containerId && s.containerPos) {
        // 判断位置的container是否建造完成 此时才能设置建造采集者功能
      }

      // 没有找到最佳位置，设置最佳位置
      if (!s.containerPos && !s.containerId) {
        const source = Game.getObjectById(s.id) as Source;
        const sourcePos = source.pos;
        const bestPosition = findBestContainerPosition(source, Game.spawns[key]);
        s.containerPos = bestPosition;
        room.createConstructionSite(bestPosition, STRUCTURE_CONTAINER);

        // 绘制半径
        room.visual.circle(sourcePos,
          { fill: 'transparent', radius: 3, stroke: 'red' });
        // 找到source附近9个点，找到可以放container且距离最近的点
      }

    });

    // 控制器查找
    if (!Memory.rooms[roomName].controlId) {
      const control = room.find(FIND_MY_STRUCTURES, {
        filter: s => s.structureType === STRUCTURE_CONTROLLER
      });
      if (control) {
        Memory.rooms[roomName].controlId = control[0].id
      }
    }

    // 最大工人数设置
    if (!Memory.rooms[roomName].maxWorker) {
      Memory.rooms[roomName].maxWorker = 4
    }

  }
}

export const toFixedList = (pos: AnyStructure = defaultRoom) => {

  Object.keys(Memory.rooms).forEach(roomName => {

    const toFixedStructures = pos.room.find(FIND_STRUCTURES, {
      filter: object => {
        const undo = unHealList.includes(object.structureType);
        return object.hits < object.hitsMax && !undo
      }
    });
    toFixedStructures.sort((a, b) => a.hits / a.hitsMax > b.hits / b.hitsMax ? 1 : -1);
    Memory.rooms[roomName].toFixedStructures = toFixedStructures;
  })

  // 不修墙




  // const roomName = pos.room.name;

  // setRoomsMemory(roomName, 'toFixedStructures', toFixedStructures)

}

export const toBuildList = () => {

  Object.keys(Memory.rooms).forEach(roomName => {
    const room = Game.rooms[roomName];
    const constructionSites = room.find(FIND_CONSTRUCTION_SITES) as ConstructionSite[];
    Memory.rooms[room.name].toConstructionSite = constructionSites;
  })
}



export const roomScanner = () => {
  findSpawns();
  toFixedList();
  toBuildList();
}