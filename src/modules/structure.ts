import { globalTask, TaskType } from "./Task";

/**
 * 
 * @param source 
 * @param spawn 
 * @description 找到建设source container最佳的建筑位置
 * @returns 
 */
export function findBestContainerPosition(source: Source, spawn: StructureSpawn) {
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
