import { findBestContainerPosition } from '@/modules/structure';
import { ROLE_NAME_ENUM } from '@/var';
import { SpawnQueue } from './autoCreate';
import { log, runPerTime, useCpu } from '@/utils';
const unHealList = [STRUCTURE_WALL, STRUCTURE_RAMPART, 'extension'];
const defaultRoom = Game.spawns['Spawn1'];

type StructureType = STRUCTURE_SPAWN | STRUCTURE_EXTENSION | STRUCTURE_CONTAINER | STRUCTURE_STORAGE | STRUCTURE_TERMINAL

/** 查找空的 可以送能量的建筑 */
export const findEmptySourceStructure = (room: Room, rank: StructureType[]) => {
  let sources: AnyStructure[] = [];
  const roomName = room.name

  if (!Memory.rooms[roomName].emptyStructureList) {
    Memory.rooms[roomName].emptyStructureList = [];
  }

  rank.some((structureType) => {
    const notFullStructures = room.find(FIND_STRUCTURES, {
      filter: (s) => {
        return (s.structureType === structureType && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
      }
    });
    if (notFullStructures.length > 0) {
      sources = notFullStructures
      return true
    } else {
      return false
    }
  });

  Memory.rooms[roomName].emptyStructureList = sources.map(e => e.id);
}

/** 找到可以拿能量的建筑 */
export const findSourceStructure = (room: Room, rank: StructureType[] = [STRUCTURE_STORAGE, STRUCTURE_CONTAINER]) => {

  let sources: AnyStructure[] = [];
  const roomName = room.name;


  rank.some((structureType) => {
    const hasSourceStructure = room.find(FIND_STRUCTURES, {
      filter: (s) => {
        return (s.structureType === structureType && s.store.getUsedCapacity(RESOURCE_ENERGY) > 0)
      }
    });

    if (hasSourceStructure.length > 0) {
      sources = hasSourceStructure
      return true
    } else {
      return false
    }
  });

  Memory.rooms[roomName].sourceStructure = sources.map(e => e.id);

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
        creepIndex: 0,
        maxWorker: 4,
        toFixedStructures: [],
        toConstructionSite: [],
        containerIdList: [],
        // 产房队列
        spawnQueue: [],
        sourcesList: [],
        emptyStructureList: [],
      };
    };

    if (!Memory.rooms[roomName].creepIndex) {
      Memory.rooms[roomName].creepIndex = 0
    }

    if (!Memory.rooms[roomName].emptyStructureList) {
      Memory.rooms[roomName].emptyStructureList = [];
    }

    if (!Memory.rooms[roomName].sourceStructure) {
      Memory.rooms[roomName].sourceStructure = [];
    }


    // 最大工人数设置
    if (!Memory.rooms[roomName].maxWorker) {
      Memory.rooms[roomName].maxWorker = 4
    }

    // 产房队列
    if (!Memory.rooms[roomName].spawnQueue) {
      Memory.rooms[roomName].spawnQueue = []
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
          creepId: null,
          containerPos: null
        }
      });
    }




    const spawnQueue = new SpawnQueue(room);

    Memory.rooms[roomName].sourcesList.forEach((s, index) => {

      /** 没有最佳位置，设置最佳位置 */
      if (!s.containerId && !s.containerPos) {
        const source = Game.getObjectById(s.id) as Source;
        const sourcePos = source.pos;
        const bestPosition = findBestContainerPosition(source, Game.spawns[key]);
        s.containerPos = bestPosition;
        room.createConstructionSite(bestPosition, STRUCTURE_CONTAINER);
        // 绘制半径
        room.visual.circle(sourcePos,
          { fill: 'transparent', radius: 3, stroke: 'red' });
      }

      /**  没有建造container  */
      if (!s.containerId && s.containerPos) {
        // 判断位置的container是否建造完成 此时才能设置建造采集者功能
        const pos = new RoomPosition(s.containerPos.x, s.containerPos.y, s.containerPos.roomName);

        /** 当前位置的建筑信息 */
        const structures = room.lookForAt(LOOK_STRUCTURES, pos)

        const containerIndex = structures.findIndex(s => s.structureType === STRUCTURE_CONTAINER);


        /** 有建筑 且是container 但是没有采集者 */
        if (containerIndex > -1 && !s.creepId) {
          // 创建采集者
          const res = spawnQueue.push(ROLE_NAME_ENUM.harvester)
          if (res) {
            s.containerId = structures[containerIndex].id;
          }
        }
      }
      
      /** 如果采集者死亡 重新创建一个采集者 */
      if (!Memory.creeps[s.creepId]) {
        s.creepId = null;
        spawnQueue.push(ROLE_NAME_ENUM.harvester)
      }



    });



    findEmptySourceStructure(room, [STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_STORAGE]);

    findSourceStructure(room, [STRUCTURE_STORAGE, STRUCTURE_CONTAINER]);


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


  runPerTime(() => {
    findSpawns();
    toFixedList();
    toBuildList();
  }, 10)

}