import { log, runPerTime, useCpu } from "@/utils";
import { globalTask, TaskType } from "./Task";
import { onControllerLevelChange } from "./Scanner";

/**
 * 
 * @param source 
 * @param spawn 
 * @description 找到建设source container最佳的建筑位置
 * @returns 
 */
export function findBestContainerPosition(source: Source | Mineral, pos: RoomPosition) {
  let possiblePositions: RoomPosition[] = [];

  const terrain = new Room.Terrain(pos.roomName);

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
    let distance = pos.getRangeTo(pos);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestPositions = pos
    }
  }
  return bestPositions;
}
type Pos = [number, number, string];


type GeneratePostionWithRangeParams = {
  center: RoomPosition;
  range?: number;
  /** 是否跳过无法建造的 */
  skipUnbuildable?: boolean;
}
/**
 * @description 生成以center为中心，range为边长的矩形范围内从左上角开始顺时针的坐标 ，只有最外圈的坐标
 * @param center 
 */
export const generatePostionWithRange = (params: GeneratePostionWithRangeParams) => {

  let { center, range = 1, skipUnbuildable = false } = params;

  let positionsArray = [] as RoomPosition[];
  let currentPos: RoomPosition
  let currentIndex = -1;


  const generatePositions = () => {

    let postionSet = new Set<string>();

    for (let x = -range; x <= range; x++) {
      // positions.push([center.x + x, center.y - range, center.roomName,]);
      postionSet.add(`${center.x + x},${center.y - range},${center.roomName}`);
    }

    for (let y = -range; y <= range; y++) {
      // positions.push([center.x + range, center.y + y, center.roomName,]);
      postionSet.add(`${center.x + range},${center.y + y},${center.roomName}`);
    }
    for (let x = range; x >= -range; x--) {
      postionSet.add(`${center.x + x},${center.y + range},${center.roomName}`);
    }
    for (let y = range; y >= -range; y--) {
      postionSet.add(`${center.x - range},${center.y + y},${center.roomName}`);
    };

    postionSet.forEach(pos => {
      const [x, y, roomName] = pos.split(',');
      const posObj = new RoomPosition(Number(x), Number(y), roomName);
      if (skipUnbuildable) {
        if (isBuildable(posObj)) {
          positionsArray.push(posObj);
        }
      } else {
        if (!isOverBorder(posObj)) {
          positionsArray.push(posObj);
        }
      }
    });
  };

  const getCurrentIndex = () => {
    return currentIndex;
  }

  const getPrePos = () => {
    return positionsArray[currentIndex - 1];
  }

  const getCurrentRange = () => {
    return range;
  }

  const getCurrentPos = () => {

    while (currentIndex === positionsArray.length - 1) {
      generatePositions();
      range++;
    }
    log.warn('module/structure/generatePostionWithRange', 'currentIndex', currentIndex, 'positionsArray.length', positionsArray, positionsArray.length)

    // if (currentIndex === positionsArray.length - 1) {
    //   generatePositions();
    //   range++;
    // };
    currentIndex++;
    currentPos = positionsArray[currentIndex];
    return currentPos;
  };

  return {
    getCurrentIndex,
    getCurrentPos,
    getCurrentRange,
    getPrePos
  }
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
    // 去除 startPos 和 endPos
    if (step.x === startPos.x && step.y === startPos.y || step.x === endPos.x && step.y === endPos.y) continue;

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
        log('module/structure', `道路建设已开始: (${pos.x}, ${pos.y})`);
      } else if (result === ERR_FULL) {
        log('module/structure', '建筑工地已满，无法创建更多建设任务');
        return;
      } else if (result === ERR_INVALID_TARGET) {
        log('module/structure', '目标位置不适合建造道路');
      }
    }
  }

  return roadedLength === path.length
}

export const isRoomExist = (roomName: string) => {
  return Game.rooms[roomName];
}

export const isMyRoom = (roomName: string) => {
  return Game.rooms[roomName].controller && Game.rooms[roomName].controller.my
}

const unHealList: StructureConstant[] = [STRUCTURE_WALL, STRUCTURE_RAMPART, STRUCTURE_EXTENSION]

/** 扫描待修复列表 */
export const toFixedList = () => {
  Object.keys(Memory.rooms).forEach(roomName => {
    if (!isRoomExist(roomName)) return;
    if (!isMyRoom(roomName)) return;
    const room = Game.rooms[roomName];
    const toFixedStructures = room.find(FIND_STRUCTURES, {
      filter: object => {
        const undo = unHealList.includes(object.structureType);
        const heal = object.hits / object.hitsMax;
        const rate = 0.8;
        if (heal < rate && !undo) {
          // log('module/structure/toFixedList', object.pos, object.structureType, 'to heal', `${object.hits} / ${object.hitsMax}`)
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
    if (!isRoomExist(roomName)) return;
    if (!isMyRoom(roomName)) return;
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

/**  */
export const isMaxExtension = (room: Room) => {

  // 每个600tick 重置maxExtension
  runPerTime(() => {
    Memory.rooms[room.name].maxExtension = false;
  }, 600);

  const maxExtension = Memory.rooms[room.name].maxExtension;
  if (maxExtension) {
    return true
  };

  const controller = room.controller;
  if (!controller || !controller.my) {
    Memory.rooms[room.name].maxExtension = true;
    return true;
  }
  const level = controller.level;


  const maxExtensions = CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][level];

  const extensions = _.filter(room.find(FIND_STRUCTURES), (structure) => structure.structureType === STRUCTURE_EXTENSION);

  if (extensions.length === maxExtensions) {
    onControllerLevelChange(room)
    Memory.rooms[room.name].maxExtension = true;
    return true
  }

  // 正在建造中的 STRUCTURE_EXTENSION
  const constructionExtension = _.filter(room.find(FIND_CONSTRUCTION_SITES), structure => {
    return structure.structureType === STRUCTURE_EXTENSION
  });


  const isExtensionLimitReached = extensions.length + constructionExtension.length >= maxExtensions;

  if (isExtensionLimitReached) {
    Memory.rooms[room.name].maxExtension = true;
    return true
  } else {
    return false
  }
}


export const isOverBorder = (pos: RoomPosition) => {
  return pos.x > 49 || pos.y > 49 || pos.x < 0 || pos.y < 0
}

export function isBuildable(pos: RoomPosition): boolean {
  // Check if the terrain is not a wall
  const terrain = Game.map.getRoomTerrain(pos.roomName);
  // 如果超过边界 返回false 
  if (isOverBorder(pos)) {
    return false;
  }
  if (terrain.get(pos.x, pos.y) === TERRAIN_MASK_WALL) {
    return false;
  }

  // Check for existing structures
  const structures = pos.lookFor(LOOK_STRUCTURES);
  if (structures.length > 0) {
    return false;
  }

  // Check for existing construction sites
  const constructionSites = pos.lookFor(LOOK_CONSTRUCTION_SITES);
  if (constructionSites.length > 0) {
    return false;
  }

  // If all checks pass, the position is buildable
  return true;
}


/**
 * 
 * @param room 
 * @description 建造仓库 房间4级 才能建造
 * @returns 
 */
export const buildStorage = (room: Room) => {
  if (room.storage) return;
  // 判断有没有正在建造的仓库
  const constructionSites = _.filter(room.find(FIND_CONSTRUCTION_SITES), structure => {
    return structure.structureType === STRUCTURE_STORAGE
  });
  if (constructionSites.length > 0) return;

  const spawns = room.find(FIND_MY_SPAWNS);
  const center = spawns[0].pos;
  const { getCurrentPos, getCurrentIndex } = generatePostionWithRange({
    center: center,
    skipUnbuildable: true
  });
  const pos = getCurrentPos();
  const res = room.createConstructionSite(pos, STRUCTURE_STORAGE);
  // log.error('module/structure/buildStorage', 'res', res)


};

/** 建造扩展 */
export const buildExtensions = (room: Room) => {
  // 清除所有带建造的建筑
  // room.find(FIND_CONSTRUCTION_SITES).forEach(s => {
  //   s.remove();
  // });

  // return

  // Ensure there is a controller
  const currentExtension = room.find(FIND_STRUCTURES, {
    filter: object => object.structureType === STRUCTURE_EXTENSION
  });
  const level = room.controller?.level;
  const maxExtensions = CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][level];


  const constructionExtension = _.filter(room.find(FIND_CONSTRUCTION_SITES), structure => {
    return structure.structureType === STRUCTURE_EXTENSION
  });

  let leftExtensionNum = maxExtensions - currentExtension.length - constructionExtension.length;

  const spawns = room.find(FIND_MY_SPAWNS);

  if (spawns.length > 0) {
    const spawn = spawns[0];
    const center = spawn.pos;

    const { getCurrentPos, getCurrentIndex } = generatePostionWithRange({
      center: center,
      skipUnbuildable: true
    });

    let constructionType = STRUCTURE_ROAD as StructureConstant;

    const toggleConstructionType = () => {
      constructionType = constructionType === STRUCTURE_ROAD ? STRUCTURE_EXTENSION : STRUCTURE_ROAD;
    }

    // return false;
    while (leftExtensionNum > 0) {
      const posObj = getCurrentPos();
      log.error('module/structure/buildExtensions', 'getIndex', getCurrentIndex());

      const result = room.createConstructionSite(posObj, constructionType);

      log.info('module/structure/buildExtensions', result, 'constructionType', constructionType, 'leftExtensionNum', leftExtensionNum, 'pos', posObj)

      if (result === OK) {
        if (constructionType === STRUCTURE_EXTENSION) {
          leftExtensionNum--;
        };
        toggleConstructionType();
      } else {
        log.error('module/structure/buildExtensions', 'createConstructionSite', result, 'constructionType', constructionType, 'leftExtensionNum', leftExtensionNum)
      }

    }
  }
};

export const buildTower = (room: Room) => {
  const level = room.controller?.level;
  const maxTowers = CONTROLLER_STRUCTURES[STRUCTURE_TOWER][level];

  const tower = room.find(FIND_STRUCTURES, {
    filter: object => object.structureType === STRUCTURE_TOWER
  });
  const constructionTowers = room.find(FIND_CONSTRUCTION_SITES, {
    filter: object => object.structureType === STRUCTURE_TOWER
  });

  let leftTowers = maxTowers - tower.length - constructionTowers.length;


  const spawns = room.find(FIND_MY_SPAWNS);
  const center = spawns[0].pos;

  if (leftTowers > 0) {
    const { getCurrentPos, getCurrentIndex } = generatePostionWithRange({
      center: center,
      skipUnbuildable: true
    });

    while (leftTowers > 0) {
      const pos = getCurrentPos();
      const result = room.createConstructionSite(pos, STRUCTURE_TOWER);
      if (result === OK) {
        leftTowers--;
      }
    }

  }
}


/**
 * 建造资源容器
 * @param room 
 */
export const buildSourceContainer = (room: Room, targetPos?: RoomPosition) => {
  const roomMemory = Memory.rooms[room.name];

  if (!isRoomExist(room.name)) return;
  if (!isMyRoom(room.name)) return;
  if (roomMemory.noSource) {
    return;
  }

  let target: RoomPosition;

  if (!targetPos) {
    target = room.find(FIND_MY_SPAWNS)[0].pos;
  };

  roomMemory.sourcesList.forEach(s => {

    // 没有containerId
    if (!s.containerId) {

      // 没有位置container建造位置
      if (!s.containerPos) {
        // 如果是能量资源
        if (s.sourceType === RESOURCE_ENERGY) {
          const source = Game.getObjectById(s.id) as Source;
          if (!source) {
            log('module/structure/buildSourceContainer', 'source not found', s.id);
            s.containerId = null;
            return;
          }
          const sourcePos = source.pos;
          const spawn = room.find(FIND_MY_SPAWNS)[0];

          const bestPosition = findBestContainerPosition(source, target);
          s.containerPos = bestPosition;
          room.createConstructionSite(bestPosition, STRUCTURE_CONTAINER);
          // 绘制半径
          room.visual.circle(sourcePos,
            { fill: 'transparent', radius: 3, stroke: 'red' });
        }


        const sourceType = s.sourceType as MineralConstant;

        // 如果是矿物
        if ([RESOURCE_UTRIUM, RESOURCE_LEMERGIUM, RESOURCE_KEANIUM, RESOURCE_ZYNTHIUM, RESOURCE_OXYGEN, RESOURCE_HYDROGEN, RESOURCE_CATALYST].includes(sourceType)) {

          const mineral = Game.getObjectById(s.id) as Mineral;
          const extractorPosition = mineral.pos;

          // 检查房间等级是否允许建造 StructureExtractor
          if (room.controller.level >= 6) {

            const extractorSite = room.createConstructionSite(extractorPosition, STRUCTURE_EXTRACTOR);
            if (extractorSite === OK) {
              log('module/structure/buildSourceContainer', `在矿物位置建造 StructureExtractor: ${extractorPosition}`);
            } else if (extractorSite === ERR_INVALID_TARGET) {
              log('module/structure/buildSourceContainer', `无法在矿物位置建造 StructureExtractor: ${extractorPosition}`);
            }

            const extractor = mineral.pos.lookFor(LOOK_STRUCTURES).find(struct => struct.structureType === STRUCTURE_EXTRACTOR);
            if (extractor) {
              // 建造容器
              const bestContainerPosition = findBestContainerPosition(mineral, target);
              if (bestContainerPosition) {
                s.containerPos = bestContainerPosition;
                room.createConstructionSite(bestContainerPosition, STRUCTURE_CONTAINER);
                room.visual.circle(mineral.pos, { fill: 'transparent', radius: 3, stroke: 'blue' });
              }
            }
          }



        };
      }

      // 有位置信息，判断是否创建建造任务
      // 判断位置的container是否建造完成 此时才能设置建造采集者功能
      else {
        const pos = new RoomPosition(s.containerPos.x, s.containerPos.y, s.containerPos.roomName);
        /** 当前位置的建筑信息 */
        const structures = room.lookForAt(LOOK_STRUCTURES, pos)
        const containerIndex = structures.findIndex(s => s.structureType === STRUCTURE_CONTAINER);

        // 判断是否有带建造的建筑
        /** 有建筑 且是container 但是没有采集者 */
        if (containerIndex > -1) {
          s.containerId = structures[containerIndex].id;
        }
      };
    }

    // 有containerId 没有道路
    if (s.containerId) {
      if (!Game.getObjectById(s.containerId)) {
        s.containerId = null;
        return;
      }
      const mySpawns = room.find(FIND_MY_SPAWNS);
      if (!mySpawns) return
      const fromPos = mySpawns[0];
      const toPos = Game.getObjectById(s.containerId) as AnyStructure;
      const roaded = buildRoadBetween(room, fromPos.pos, toPos.pos);
      if (roaded) {
        s.roaded = true
      }
    }

  })
}

export const buildControllerRoad = (room: Room, targetPos?: RoomPosition) => {
  const roomMemory = Memory.rooms[room.name];
  if (roomMemory.controllerRoad) {
    return true
  }
  let target: RoomPosition;

  if (!targetPos) {
    target = room.find(FIND_MY_SPAWNS)[0].pos
  }
  const success = buildRoadBetween(room, target, room.controller.pos)
  if (success) {
    roomMemory.controllerRoad = true;
  }
}

export const autoStructure = (room: Room) => {
  // 有控制器的房间
  if (room.controller && room.controller.my) {
    // 房间控制等级
    const level = room.controller?.level;



    buildSourceContainer(room)

    if (!isMaxExtension(room)) {
      useCpu(() => {
        buildExtensions(room)
      }, 'buildExtensions')
      // 如果达到extension建造上限，则不建造
    }


    // 二级的时候，升级
    if (level >= 2) {
      // 建造控制器道路
      buildControllerRoad(room)
    }
    if (level >= 3) {
      buildTower(room)
    };
    if (level >= 4) {
      buildStorage(room)
    }

  }

}



