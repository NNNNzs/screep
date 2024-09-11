import task, { TaskType } from "./Task";

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

const unHealList = [STRUCTURE_WALL, STRUCTURE_RAMPART, 'extension'];

export const toFixedList = () => {
  Object.keys(Memory.rooms).forEach(roomName => {
    const room = Game.rooms[roomName];
    const toFixedStructures = room.find(FIND_STRUCTURES, {
      filter: object => {
        const undo = unHealList.includes(object.structureType);
        return object.hits < object.hitsMax && !undo
      }
    });
    toFixedStructures.sort((a, b) => a.hits / a.hitsMax > b.hits / b.hitsMax ? 1 : -1);
    toFixedStructures.forEach((s, index) => {
      task.add({
        targetId: s.id,
        type: TaskType.repair,
      })
    })
    Memory.rooms[roomName].toFixedStructures = toFixedStructures;
  })
};


/** 扫描代建造列表 */
export const toBuildList = () => {

  Object.keys(Memory.rooms).forEach(roomName => {
    const room = Game.rooms[roomName];
    const constructionSites = room.find(FIND_CONSTRUCTION_SITES) as ConstructionSite[];
    Memory.rooms[room.name].toConstructionSite = constructionSites;
  });
}
