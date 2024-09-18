import { TaskType } from "@/modules/Task";

import { take, carry } from '@/role/work';
import { sortByUsedCapacity } from "@/utils";

// storage: role.carry
const tt = '60199445a8628c34e4c3bc81';

const assignTasks = (creep: Creep) => {

  const roomName = creep.room.name;
  const room = Game.rooms[roomName];

  const roomMemory = Memory.rooms[roomName];


  const emptySource = creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0;
  const hasSource = creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0;

  const emptySpawn = _.cloneDeep(roomMemory.emptyStructureList)

  // 优先从各种地方拿资源送到生产队列



  const tombstones = room.find(FIND_TOMBSTONES, {
    filter: (s) => s.store.getUsedCapacity() > 0
  });

  const ruins = room.find(FIND_RUINS, {
    filter: (s) => s.store.getUsedCapacity() > 0
  });


  if (!hasSource) {
    creep.memory.task = TaskType.carry;
  }

  // 拿资源模式
  if (emptySource && Memory.rooms[roomName].sourceStructure.length > 0) {
    const sourceStructure = _.cloneDeep(Memory.rooms[roomName].sourceStructure);

    // 匹配到是从storage里面拿 需要注意
    if (sourceStructure.length === 1) {
      const target = Game.getObjectById(sourceStructure[0]) as AnyStoreStructure;

      // 只有 没满spwan，才能从storage里面拿，否则都是从 container拿
      if (target.structureType === STRUCTURE_STORAGE) {
        const includesList = [STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_TOWER, STRUCTURE_TERMINAL];

        // 以上类型都满了，才能从storage里面拿
        const spwans = creep.room.find(FIND_MY_STRUCTURES, {
          filter: (s) => {
            // @ts-ignore
            const hasStore = s?.store;
            // @ts-ignore
            const notFull = hasStore && s.store.getFreeCapacity(RESOURCE_ENERGY) < 0;
            // @ts-ignore
            const include = includesList.includes(s.structureType);

            return notFull && include
          }
        });


        // 如果这些都满了，那就从container里面拿
        if (spwans.length === 0) {

          const hasSourceContainer = room.find(FIND_STRUCTURES, {
            filter: (s) => {
              return (s.structureType === STRUCTURE_CONTAINER && s.store.getUsedCapacity(RESOURCE_ENERGY) > 0)
            }
          }) as AnyStoreStructure[]

          if (hasSourceContainer.length > 0) {
            const containerList = sortByUsedCapacity(hasSourceContainer.map(e => e.id));

            creep.memory.task = TaskType.take;
            creep.memory.targetId = containerList[0];
            return;
          }

        }

      };
    }

    // 正常从container拿
    else if (sourceStructure.length > 1) {
      sourceStructure.sort((a, b) => {
        const aSource = Game.getObjectById(a) as StructureContainer
        const bSource = Game.getObjectById(b) as StructureContainer

        // 根据剩余能量排序
        return bSource.store.getUsedCapacity(RESOURCE_ENERGY) - aSource.store.getUsedCapacity(RESOURCE_ENERGY);
      });
    }

    creep.memory.task = TaskType.take;
    creep.memory.targetId = sourceStructure[0];
    const target = Game.getObjectById(creep.memory.targetId) as AnyStoreStructure;

    creep.memory.from = target.structureType;
  }

  // 如果有空的spawn extension，优先送货
  else if (hasSource && emptySpawn.length > 0) {

    // 先过滤到没有被分配的
    const freeSpawn = emptySpawn.sort((a, b) => {
      const aSource = Game.getObjectById(a) as StructureExtension
      const bSource = Game.getObjectById(b) as StructureExtension
      const adistance = aSource.pos.getRangeTo(creep.pos)
      const bdistance = bSource.pos.getRangeTo(creep.pos)
      // 返回距离最近的
      return adistance - bdistance
    });

    creep.memory.task = TaskType.carry;
    creep.memory.targetId = freeSpawn[0];

  }

  else if (tombstones.length > 0) {
    creep.memory.task = TaskType.take;
    creep.memory.targetId = tombstones[0].id;
  }

  else if (ruins.length > 0) {
    creep.memory.task = TaskType.take;
    creep.memory.targetId = ruins[0].id;
  } else {
    console.log('无任务');
    creep.memory.task = null;
  }


  // 捡资源模式


  // 送资源模式

}

const roleCarryRun = (creep: Creep) => {


  if (!creep.memory.task) {
    assignTasks(creep);
    roleCarryRun(creep);
  }

  const task = creep.memory.task;
  const target = Game.getObjectById(creep.memory.targetId) as Source;

  if (!target) {
    assignTasks(creep);
    roleCarryRun(creep);
    return
  }

  switch (task) {
    case TaskType.take: {
      const res = take(creep);
      if (res === false) {
        assignTasks(creep);
        roleCarryRun(creep);
      }
      break;
    }

    case TaskType.carry: {
      const res = carry(creep);
      if (res === false) {
        assignTasks(creep);
        roleCarryRun(creep);
      }
      break;
    }

  }

  return;


  const freeCapacity = creep.store.getFreeCapacity()
  // 如果存储空间为0，则应该去送货
  if (freeCapacity == 0) {
    creep.memory.carring = true
  };

  // 转移模式
  // if (Memory.showTransfer && Memory.showTransfer && index === 0) {
  //   const sourceType = Memory.transferSrouceType;
  //   const terminal = Game.getObjectById(Memory.terminal);

  //   if (freeCapacity == 0) {

  //     Object.keys(creep.carry).forEach(carrySrouceType => {
  //       if (creep.transfer(terminal, carrySrouceType) == ERR_NOT_IN_RANGE) {
  //         creep.moveTo(terminal);
  //       }
  //     })

  //   } else {
  //     const storage = Game.getObjectById(Memory.storage);
  //     creep.say(freeCapacity)
  //     if (creep.withdraw(storage, sourceType) == ERR_NOT_IN_RANGE) {
  //       creep.moveTo(storage);
  //     }
  //   }
  //   return false;
  // }

  /** 

  // 从坑位里面拿货
  if (freeCapacity > 0 && !creep.memory.carring) {

    // 目标
    let sources;
    try {
      sources = Game.getObjectById(Memory.containerList[index % Length].id)
    } catch (error) {
      sources = Game.getObjectById(tt);
    }
    // 当自己的坑位空了的时候，去别人的坑位
    if (sources.store.getUsedCapacity() == 0 && Length !== 0) {
      index++
      sources = Game.getObjectById(Memory.containerList[index % Length].id)
    }

    // 所有container空了
    const isContainersEmtyp = creep.isStructureEmpty(Memory.containerList.map(e => Game.getObjectById(e.id)));
    // 还有
    const isSpawnEmpty = creep.room.find(FIND_STRUCTURES, {
      filter: (s) => {
        return (
          [STRUCTURE_EXTENSION, STRUCTURE_SPAWN].includes(s.structureType) &&
          s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        )
      }
    });

    // FIND_TOMBSTONES
    // 有资源的墓碑
    const tombstones = creep.room.find(FIND_TOMBSTONES, {
      filter: (s) => s.store.getUsedCapacity() > 0
    });
    const ruins = creep.room.find(FIND_RUINS, {
      filter: (s) => s.store.getUsedCapacity() > 0
    });

    // 如果container空了，但是spaw和extension空着的，从storage里面拿
    if (isContainersEmtyp && isSpawnEmpty.length > 0) {
      creep.say('空啦')
      sources = Game.getObjectById(tt)
    }

    // 从墓碑获取
    if (tombstones.length > 0) {
      sources = tombstones[0]
      for (const resourceType in sources.store) {
        if (creep.withdraw(sources, resourceType) == ERR_NOT_IN_RANGE) {
          creep.moveTo(sources);
        }
      }
    } else if (ruins.length > 0) {
      sources = ruins[0]
      for (const resourceType in sources.store) {
        if (creep.withdraw(sources, resourceType) == ERR_NOT_IN_RANGE) {
          creep.moveTo(sources);
        }
      }
    }
    else {
      if (creep.withdraw(sources, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(sources);
      }
    }
  }
  else {
    // const isFu = creep.isStructureFull([STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_TOWER]);
    // console.log(isFu)
    // 给建筑充能,存放资源
    const isFull = creep.sendRourceToStructure([STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_TOWER, STRUCTURE_POWER_SPAWN], index % 2 === 0)


    const hasOtherSource = Object.keys(creep.carry).some(e => e != RESOURCE_ENERGY)

    if (hasOtherSource) {
      const target = Game.getObjectById(tt)
      for (const resourceType in creep.carry) {
        if (creep.transfer(target, resourceType) == ERR_NOT_IN_RANGE) {
          creep.moveTo(target);
        }
      }
    }
    else if (isFull) {
      const target = Game.getObjectById(tt)
      if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(target);
      }
    }


    // 如果可用能量空了，则去挖矿
    if (creep.store.getUsedCapacity() == 0) {
      creep.memory.carring = false
    }
  }
    */

}
const roleCarry = {
  run: function (creep: Creep) {
    roleCarryRun(creep)
  },
};

export default roleCarry;