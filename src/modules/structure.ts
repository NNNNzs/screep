import { globalTask, TaskType } from "./Task";

/**
 * 
 * @param source 
 * @param spawn 
 * @description 找到建设source container最佳的建筑位置
 * @returns 
 */
export function findBestContainerPosition(source: Source | Mineral, spawn: StructureSpawn) {
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


/**
 * @description 在 startPos 和 endPos 之间使用 PathFinder 查找路径，然后在路径上每个位置检查是否已经有道路或建设中的道路，如果没有就创建道路 construction site
 * @param {Room} room
 * @param {RoomPosition} startPos
 * @param {RoomPosition} endPos
 * @returns {boolean} 是否成功
 */
export function buildRoadBetween(room: Room, startPos: RoomPosition, endPos: RoomPosition) {
  // 使用 PathFinder 查找从 startPos 到 endPos 的路径
  const path = room.findPath(startPos, endPos, { ignoreCreeps: true });

  // 检查路径是否为空
  if (path.length === 0) return false;

  let roadedLength = 0; // 修正拼写错误

  // 遍历路径上的每个位置
  for (const step of path) {
    const pos = new RoomPosition(step.x, step.y, room.name);

    // 检查该位置是否已经有道路或建设中的道路
    const structures = pos.lookFor(LOOK_STRUCTURES);
    const constructionSites = pos.lookFor(LOOK_CONSTRUCTION_SITES);

    let hasRoad = false;

    // 检查是否已经有道路
    for (const structure of structures) {
      if (structure.structureType === STRUCTURE_ROAD) {
        hasRoad = true;
        roadedLength++; // 修正拼写错误
        break;
      }
    }

    // 检查是否有正在建造的道路
    for (const site of constructionSites) {
      if (site.structureType === STRUCTURE_ROAD) {
        hasRoad = true;
        roadedLength++; // 修正拼写错误
        break;
      }
    }

    // 如果没有道路，也没有待建造的道路，创建道路 construction site
    if (!hasRoad) {
      const result = room.createConstructionSite(pos, STRUCTURE_ROAD);
      if (result === OK) {
        console.log(`道路建设已开始: (${pos.x}, ${pos.y})`);
      } else if (result === ERR_FULL) {
        console.log('建筑工地已满，无法创建更多建设任务');
        return;
      } else if (result === ERR_INVALID_TARGET) {
        console.log('目标位置不适合建造道路');
      }
    }
  }

  return roadedLength === path.length
}


const unHealList: StructureConstant[] = [STRUCTURE_WALL, STRUCTURE_RAMPART, STRUCTURE_EXTENSION]
export const toFixedList = () => {
  Object.keys(Memory.rooms).forEach(roomName => {
    const room = Game.rooms[roomName];
    const toFixedStructures = room.find(FIND_STRUCTURES, {
      filter: object => {
        const undo = unHealList.includes(object.structureType);
        const heal = object.hits / object.hitsMax;
        const rate = 0.8;
        if (heal < rate && !undo) {
          // console.log(object.pos, object.structureType, 'to heal', `${object.hits} / ${object.hitsMax}`)
        }

        return heal < rate && !undo
      }
    });

    toFixedStructures.sort((a, b) => {
      return a.hits / a.hitsMax - b.hits / b.hitsMax
    });

    // toFixedStructures.forEach((s, index) => {
    //   globalTask.add({
    //     targetId: s.id,
    //     type: TaskType.repair,
    //     orderNum: 5
    //   })
    // });

    Memory.rooms[roomName].toFixedStructures = toFixedStructures;
  })
};


/** 扫描待建造列表 */
export const toBuildList = () => {
  Object.keys(Memory.rooms).forEach(roomName => {
    const room = Game.rooms[roomName];
    const constructionSites = room.find(FIND_CONSTRUCTION_SITES) as ConstructionSite[];
    Memory.rooms[room.name].toConstructionSite = constructionSites;

    // constructionSites.forEach((s, index) => {
    //   globalTask.add({
    //     targetId: s.id,
    //     type: TaskType.build,
    //     orderNum: 6
    //   })
    // });

  });
}

export const isMaxExtension = (room: Room) => {
  const maxExtension = Memory.rooms[room.name].maxExtension;

  if (maxExtension) {
    return true
  }
  const controller = room.controller;
  if (!controller) {
    Memory.rooms[room.name].maxExtension = true;
    return true;
  }
  const level = controller.level;


  const maxExtensions = CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][level];

  const extensions = _.filter(room.find(FIND_STRUCTURES), (structure) => structure.structureType === STRUCTURE_EXTENSION);
  const isExtensionLimitReached = extensions.length >= maxExtensions;

  if (isExtensionLimitReached) {
    Memory.rooms[room.name].maxExtension = true;
    return true
  } else {
    return false
  }
}


const hasStructureInRange = (pos: RoomPosition, range = 1) => {
  // 判断这个点周围3*3的范围内是否有建筑
  for (let x = -range; x <= range; x++) {
    for (let y = -range; y <= range; y++) {
      const checkPos = new RoomPosition(pos.x + x, pos.y + y, pos.roomName);
      const structures = checkPos.lookFor(LOOK_STRUCTURES);
      const constructionSites = checkPos.lookFor(LOOK_CONSTRUCTION_SITES);
      if (structures.length > 0 || constructionSites.length > 0) {
        return true;
      }
    }
  }
  return true;
};


export const buildExtensions = (room: Room) => {
  // 需要确保有控制器
  const currentExtension = room.find(FIND_STRUCTURES, {
    filter: object => object.structureType === STRUCTURE_EXTENSION
  });
  const level = room.controller?.level;
  const maxExtensions = CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][level];

  let left = maxExtensions - currentExtension.length;

  const spawns = room.find(FIND_MY_SPAWNS);

  // 是否可以建造
  const canBuild = (pos: RoomPosition) => {
    // 这个点附近的建筑
    const structures = pos.lookFor(LOOK_STRUCTURES);
    const constructionSites = pos.lookFor(LOOK_CONSTRUCTION_SITES);
    const hasRoad = structures.some(s => s.structureType === STRUCTURE_ROAD);

  };

  if (spawns.length > 0) {
    const spawn = spawns[0]
    const center = spawn.pos;
    // 以spawn  为中心，先建造道路，再建造extension，顺序是从内向外建造，按照上右下左的顺序，逐次增加半径
    let range = 1;

    let positions = [
      // 上
      new RoomPosition(center.x, center.y - range, center.roomName),
      // 右
      new RoomPosition(center.x + range, center.y, center.roomName),
      // 下
      new RoomPosition(center.x, center.y + range, center.roomName),
      // 左
      new RoomPosition(center.x - range, center.y, center.roomName),
    ];

    const generatePositions = (range: number) => {
      positions = [
        // 上
        new RoomPosition(center.x, center.y - range, center.roomName),
        // 右
        new RoomPosition(center.x + range, center.y, center.roomName),
        // 下
        new RoomPosition(center.x, center.y + range, center.roomName),
        // 左
        new RoomPosition(center.x - range, center.y, center.roomName),
      ]
    }


    while (left > 0) {
      positions.shift();
    }

  }


}

export const autoStructure = (room: Room) => {
  // 有控制器的房间
  if (room.controller) {
    // 房间控制等级
    const level = room.controller?.level;

    if (!isMaxExtension(room)) {
      buildExtensions(room)
      // 如果达到extension建造上限，则不建造
    }

    if (level >= 1) {
      // 一级的时候，建造
    }

    if (level >= 2) {
      // 二级的时候，升级
    }

  }

}

