import { findBestContainerPosition, toFixedList, toBuildList, buildRoadBetween } from '@/modules/structure';
import { ROLE_NAME_ENUM } from '@/var';
import { SpawnQueue, deleteCreepMemory } from './autoCreate';
import { log, runAfterTickTask, runPerTime, useCpu } from '@/utils';
import { globalTask, TaskType } from './Task'

export type StructureType = STRUCTURE_SPAWN | STRUCTURE_EXTENSION | STRUCTURE_CONTAINER | STRUCTURE_STORAGE | STRUCTURE_TERMINAL | STRUCTURE_TOWER;

export const initMemory = () => {

  if (!Memory.rooms) {
    Memory.rooms = {};
  }

  Object.keys(Memory.rooms).forEach((roomName) => {

    // 找到资源点附近可以放container的位置
    if (!Memory.rooms[roomName]) {

      Memory.rooms[roomName] = {

        noSource: false,

        creepIndex: 0,

        maxWorker: 4,

        carrysLength: 0,

        harvestersLength: 0,

        toFixedStructures: [],

        toConstructionSite: [],
        // 产房队列
        spawnQueue: [],

        sourcesList: [],

        emptyStructureList: [],
      };
    };

    if (!Memory.rooms[roomName].emptyStructureList) {
      Memory.rooms[roomName].emptyStructureList = [];
    }
    // sourceStructure

    if (!Memory.rooms[roomName].sourceStructure) {
      Memory.rooms[roomName].sourceStructure = [];
    }

    if (!Memory.rooms[roomName].creepIndex) {
      Memory.rooms[roomName].creepIndex = 0
    }


    // 最大工人数设置
    if (!Memory.rooms[roomName].maxWorker) {
      Memory.rooms[roomName].maxWorker = 4;

    }

    // 产房队列
    if (!Memory.rooms[roomName].spawnQueue) {
      Memory.rooms[roomName].spawnQueue = []
    }

  })

}

/** 查找空的 可以送能量的建筑 */
export const findEmptySourceStructure = (room: Room, rank: StructureType[]) => {
  let sources: AnyStructure[] = [];
  const roomName = room.name;


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

    // globalTask.add({
    //   id: e.id,
    //   type: TaskType.take,
    //   targetId: e.id,
    //   executorId: []
    // })

    return e.id
  });
}

/**
 * 
 * @param room 
 * @param rank 
 * @description 可以拿能量的建筑
 * @returns {sourceStructure} 
 */
export const findSourceStructure = (room: Room, rank: StructureType[] = [STRUCTURE_STORAGE, STRUCTURE_CONTAINER]) => {

  let sources: AnyStoreStructure[] = [];
  const roomName = room.name;


  rank.some((structureType) => {
    const hasSourceStructure = room.find(FIND_STRUCTURES, {
      filter: (s) => {
        return (s.structureType === structureType && s.store.getUsedCapacity(RESOURCE_ENERGY) > 0)
      }
    }) as AnyStoreStructure[]

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
  for (const spawnName in Game.spawns) {

    const room = Game.spawns[spawnName].room;


    updateSourceList(room, spawnName);

    findEmptySourceStructure(room, [STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_TOWER]);

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
  const roomName = room.name;
  const roomMemory = Memory.rooms[roomName]

  // 资源列表
  if (!roomMemory.noSource && roomMemory.sourcesList.length === 0) {
    // 找到资源点
    const sources = room.find(FIND_SOURCES);
    // 初始化container点的数据
    roomMemory.sourcesList = sources.map(s => {
      return {
        sourceType: RESOURCE_ENERGY,
        id: s.id,
        containerId: null,
        creepId: null,
        containerPos: null
      }
    });

    const mineral = room.find(FIND_MINERALS);
    if (mineral.length > 0) {
      // 有矿物
      mineral.forEach(m => {
        roomMemory.sourcesList.push({
          sourceType: m.mineralType,
          id: m.id,
          containerId: null,
          creepId: null,
          containerPos: null
        })
      });
    }

    if (sources.length === 0) {
      console.log(roomName + "没有资源点");
      roomMemory.noSource = true
    }
  }


  !roomMemory.noSource && roomMemory.sourcesList.forEach((s, index) => {

    // 检查container是否存在
    if (s.containerId) {
      const container = Game.getObjectById(s.containerId) as StructureContainer;
      if (!container) {
        s.containerId = null;
      } else {

        if (!Memory.creeps[s.creepId]) {
          s.creepId = null
        }

        // 如果 creepId的target不是这个 清楚
        if (Game.creeps[s.creepId] && Game.creeps[s.creepId].memory.targetId !== s.id) {
          s.creepId = null
        }

      }
    }

    // 判断是否建造道路
    if (!s.roaded && s.containerId) {
      const mySpawns = room.find(FIND_MY_SPAWNS);
      if (!mySpawns) return
      const fromPos = mySpawns[0];
      const toPos = Game.getObjectById(s.containerId) as AnyStructure;
      const roaded = buildRoadBetween(room, fromPos.pos, toPos.pos);
      if (roaded) {
        s.roaded = true
      }
    }

    if (!s.containerId) {

      // 没有位置container建造位置
      if (!s.containerPos) {
        // 如果是能量资源
        if (s.sourceType === RESOURCE_ENERGY) {
          const source = Game.getObjectById(s.id) as Source;
          console.log('source', source);
          const sourcePos = source.pos;
          const bestPosition = findBestContainerPosition(source, Game.spawns[spawnName]);
          s.containerPos = bestPosition;
          room.createConstructionSite(bestPosition, STRUCTURE_CONTAINER);
          // 绘制半径
          room.visual.circle(sourcePos,
            { fill: 'transparent', radius: 3, stroke: 'red' });
        }

        // 如果是矿物
        else {
          const mineral = Game.getObjectById(s.id) as Mineral;
          const extractorPosition = mineral.pos;

          // 检查房间等级是否允许建造 StructureExtractor
          if (room.controller.level >= 1) {
            const extractorSite = room.createConstructionSite(extractorPosition, STRUCTURE_EXTRACTOR);
            if (extractorSite === OK) {
              console.log(`在矿物位置建造 StructureExtractor: ${extractorPosition}`);
            } else if (extractorSite === ERR_INVALID_TARGET) {
              console.log(`无法在矿物位置建造 StructureExtractor: ${extractorPosition}`);
            }
          }

          const extractor = mineral.pos.lookFor(LOOK_STRUCTURES).find(struct => struct.structureType === STRUCTURE_EXTRACTOR);

          if (extractor) {
            // 建造容器
            const bestContainerPosition = findBestContainerPosition(mineral, Game.spawns[spawnName]);
            if (bestContainerPosition) {
              s.containerPos = bestContainerPosition;
              room.createConstructionSite(bestContainerPosition, STRUCTURE_CONTAINER);
              room.visual.circle(mineral.pos, { fill: 'transparent', radius: 3, stroke: 'blue' });
            }
          }

        }

      } else {

        // 有位置信息，判断是否创建建造任务
        // 判断位置的container是否建造完成 此时才能设置建造采集者功能
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
  });

}

/** 查找敌人 */
export const findAttackers = () => {
  Object.keys(Memory.rooms).forEach(roomName => {

    if (!Memory.rooms[roomName].attackers) {
      Memory.rooms[roomName].attackers = [];
    };

    const attackers = Game.rooms[roomName].find(FIND_HOSTILE_CREEPS)

    if (attackers.length > 0) {

      Memory.rooms[roomName].attackers = attackers.map(a => {
        return {
          id: a.id
        }
      })
      Game.notify(`房间${roomName}有${attackers.length}个攻击者, 请注意! 时间是${Game.time}`);
    }

    const towns = Game.rooms[roomName].find(FIND_MY_STRUCTURES, {
      filter: object => {
        return object.structureType === STRUCTURE_TOWER
      }
    }) as StructureTower[];

    if (towns.length === 0) {
      return
    }

    towns.forEach(t => {
      t.attack(attackers[0])
    });

    if (towns.length > 0) {
      const toHeal = Game.rooms[roomName].find(FIND_MY_CREEPS, {
        filter: object => {
          // 生命值不慢的
          return object.hits < object.hitsMax;
        }
      });

      if (toHeal.length > 0) {
        towns[0].heal(toHeal[0])
      }

    }



  });

};


export const roomScanner = () => {

  initMemory();

  findSpawns();

  deleteCreepMemory();

  toFixedList();
  findAttackers();

  runPerTime(() => {
    toBuildList();
  }, 10);

  runAfterTickTask();

}