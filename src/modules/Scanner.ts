import { findBestContainerPosition, toFixedList, toBuildList } from '@/modules/structure';
import { ROLE_NAME_ENUM } from '@/var';
import { SpawnQueue, deleteCreepMemory } from './autoCreate';
import { log, runAfterTickTask, runPerTime, useCpu } from '@/utils';
import { globalTask, TaskType } from './Task'

type StructureType = STRUCTURE_SPAWN | STRUCTURE_EXTENSION | STRUCTURE_CONTAINER | STRUCTURE_STORAGE | STRUCTURE_TERMINAL | STRUCTURE_TOWER

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

  Memory.rooms[roomName].emptyStructureList = sources.map(e => {

    globalTask.add({
      id: e.id,
      type: TaskType.take,
      targetId: e.id,
      executorId: []
    })

    return e.id
  });
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






    updateSourceList(room, key);

    findEmptySourceStructure(room, [STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_TOWER, STRUCTURE_STORAGE]);

    findSourceStructure(room, [STRUCTURE_STORAGE, STRUCTURE_CONTAINER]);


  }
}


/**
 * Updates the source list for the given room. This is called every tick and manages the
 * following tasks:
 * - Finds the best container position for each source
 * - Creates a construction site for the container
 * - Checks if the container is built and assigns a harvester creep to each source
 * - Assigns a harvester creep to each source if the container is built
 * - Replaces dead harvester creeps
 * @param room The room to update
 * @param spawnName The name of the spawn to use for creating new creeps
 */
export const updateSourceList = (room: Room, spawnName: string) => {
  const spawnQueue = new SpawnQueue(room);
  const roomName = room.name;

  Memory.rooms[roomName].sourcesList.forEach((s, index) => {

    /** 没有最佳位置，设置最佳位置 */
    if (!s.containerId && !s.containerPos) {
      const source = Game.getObjectById(s.id) as Source;
      const sourcePos = source.pos;
      const bestPosition = findBestContainerPosition(source, Game.spawns[spawnName]);
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

  });

}



export const roomScanner = () => {

  runPerTime(() => {
    deleteCreepMemory();
    findSpawns();
    toFixedList();
    toBuildList();
  }, 10);

  runAfterTickTask();

}