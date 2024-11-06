import { findBestContainerPosition, toFixedList, toBuildList, autoStructure, isRoomExist } from '@/modules/structure';
import { ROLE_NAME_ENUM } from '@/var';
import { SpawnQueue, deleteCreepMemory } from './autoCreate';
import { log, runAfterTickTask, runPerTime, useCpu } from '@/utils';
import { globalTask, TaskType } from './Task'

export type StructureType = STRUCTURE_SPAWN | STRUCTURE_EXTENSION | STRUCTURE_CONTAINER | STRUCTURE_STORAGE | STRUCTURE_TERMINAL | STRUCTURE_TOWER;

/** 扫描所有可见范围的房间，添加Memory */
export const initMemory = () => {

  if (!Memory.logLevel) {
    Memory.logLevel = ['info', 'warn', 'error'];
  }

  if (!Memory.rooms) {
    Memory.rooms = {};
  }

  Object.keys(Game.rooms).forEach((roomName) => {

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

    if (!Memory.rooms[roomName].controllerLevel) {
      Memory.rooms[roomName].controllerLevel = 0
    }


  })

}

/** 查找空的 可以送能量的建筑 */
export const findEmptySourceStructure = (room: Room, rank: StructureType[]) => {
  let sources: AnyStoreStructure[] = [];
  const roomName = room.name;


  rank.some((structureType) => {
    const notFullStructures = room.find(FIND_STRUCTURES, {
      filter: (s) => {
        return (s.structureType === structureType && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
      }
    }) as AnyStoreStructure[]
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

/**  */
export const scanStructure = () => {

  for (const roomName in Memory.rooms) {
    const room = Game.rooms[roomName];
    if (!room) continue;

    
    autoStructure(room);

    updateSourceList(room);

    findEmptySourceStructure(room, [STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_TOWER]);

    findSourceStructure(room, [STRUCTURE_STORAGE, STRUCTURE_CONTAINER]);

    updateControllerLevel(room);

    roomRoaded(room);
  }

}

export const roomRoaded = (room: Room) => {


  const roomName = room.name;
  const roomMemory = Memory.rooms[roomName];

  runPerTime(function resetRoaded() {
    roomMemory.roaded = false;
  }, 601);

  if (roomMemory.roaded) {
    return true
  };

  if (room.controller && room.controller.my) {
    const controller = room.controller;
    const level = controller.level;

    const energyContainerRoaded = () => {
      const sourceNotRoaded = roomMemory.sourcesList.some(s => {
        if (s.sourceType === RESOURCE_ENERGY && !s.roaded) {
          return true
        }
        return false
      });
      return !sourceNotRoaded
    }
    let checkList = [];

    if (level >= 2) {
      const roaded = energyContainerRoaded();
      checkList.push(roaded);
      // log.warn('module/Scanner/roomRoaded', 'roaded', roaded)
    }

    if (level >= 3) {
      const controllerRoaded = roomMemory.controllerRoaded;
      // log.warn('module/Scanner/roomRoaded', 'controllerRoaded', controllerRoaded)
      checkList.push(controllerRoaded);
    }
    log.warn('module/Scanner/roomRoaded', 'checkList', checkList)
    roomMemory.roaded = checkList.every(e => e);

  }
}


export const onControllerLevelChange = (room: Room) => {
  // 重置 最大扩展 
  Memory.rooms[room.name].maxExtension = false;
  // 重置 道路
  Memory.rooms[room.name].roaded = false;

  // 重置 最大工人数
  for (const creepName in Game.creeps) {
    // Game.creeps[creepName].memory.isMaxCountBody = false;
    delete Game.creeps[creepName].memory.isMaxCountBody;
  }
}

export const updateControllerLevel = (room: Room) => {
  const controller = room.controller;
  if (controller) {
    const oldLevel = Memory.rooms[room.name].controllerLevel;
    const newLevel = controller.level;
    if (oldLevel !== newLevel) {
      Memory.rooms[room.name].controllerLevel = newLevel
      onControllerLevelChange(room)
    }
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
export const updateSourceList = (room: Room) => {
  const roomName = room.name;
  const roomMemory = Memory.rooms[roomName];

  if (roomMemory.noSource) {
    return;
  }

  // 资源列表
  if (roomMemory.sourcesList.length === 0) {
    // 找到资源点
    const sources = room.find(FIND_SOURCES);

    const mineral = room.find(FIND_MINERALS);


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
      roomMemory.noSource = true
    }
  }

  roomMemory.sourcesList.forEach((s, index) => {

    // 检查container 是否过期
    if (s.containerId) {
      const container = Game.getObjectById(s.containerId) as StructureContainer;

      if (!container) {
        s.containerId = null;
      }

      // 如果有container 检查采集者是否过期
      if (container) {

        const creepDied = !Game.creeps[s.creepId];

        // 如果采集者过期
        if (creepDied) {
          s.creepId = null
        }

        // 如果 creepId的target不是这个 清除

        if (!creepDied && Game.creeps[s.creepId].memory.targetId !== s.id) {
          s.creepId = null
        }
      };

    }



  });

}

/** 查找敌人 */
export const findAttackers = () => {
  Object.keys(Memory.rooms).forEach(roomName => {

    if (!Game.rooms[roomName]) return;

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
  // 初始化rooms 

  initMemory();

  scanStructure();

  deleteCreepMemory();

  toFixedList();
  findAttackers();

  toBuildList();

  runAfterTickTask();


}