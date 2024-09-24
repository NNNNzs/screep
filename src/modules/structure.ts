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
 */
export function buildRoadBetween(room: Room, startPos: RoomPosition, endPos: RoomPosition) {
  // 使用 PathFinder 查找从 startPos 到 endPos 的路径
  const path = room.findPath(startPos, endPos, { ignoreCreeps: true });

  let rodedLength = 0;

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
        rodedLength++
        break;
      }
    }

    // 检查是否有正在建造的道路
    for (const site of constructionSites) {
      if (site.structureType === STRUCTURE_ROAD) {
        hasRoad = true;
        rodedLength++
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

  return rodedLength === path.length
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
