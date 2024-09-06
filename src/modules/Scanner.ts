import { findBestContainerPosition } from '@/modules/structure';
import { ROLE_NAME_ENUM } from '@/var';
const unHealList = [STRUCTURE_WALL, STRUCTURE_RAMPART, 'extension'];
const defaultRoom = Game.spawns['Spawn1'];


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
        creepIndex: 0,
        maxWorker: 4,
        toFixedStructures: [],
        toConstructionSite: [],
        containerIdList: [],
        // 产房队列
        spawnQueue: [],
        sourcesList: [],
        controlId: null
      };
    }
    if (!Memory.rooms[roomName].creepIndex) {
      Memory.rooms[roomName].creepIndex = 0
    }

    // 资源列表
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
        const pos = new RoomPosition(s.containerPos.x, s.containerPos.y, s.containerPos.roomName);

        const structures = room.lookForAt(LOOK_STRUCTURES, pos);

        const containerIndex = structures.findIndex(s => s.structureType === STRUCTURE_CONTAINER);

        if (structures.length > 0 && containerIndex !== -1) {
          s.containerId = structures[containerIndex].id;
          room.memory.spawnQueue.push(ROLE_NAME_ENUM.harvester);
        }

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

    // 产房队列
    if (!Memory.rooms[roomName].spawnQueue) {
      Memory.rooms[roomName].spawnQueue = []
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
}

export const toBuildList = () => {

  Object.keys(Memory.rooms).forEach(roomName => {
    const room = Game.rooms[roomName];
    const constructionSites = room.find(FIND_CONSTRUCTION_SITES) as ConstructionSite[];
    Memory.rooms[room.name].toConstructionSite = constructionSites;
  });
}



export const roomScanner = () => {
  findSpawns();
  toFixedList();
  toBuildList();
}