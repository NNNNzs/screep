import { TaskType } from "@/modules/Task";
import take from "@/behavior/take";
import carry from "@/behavior/carry";
import { sortByUsedCapacity } from "@/utils";
import renew, { CREEP_LIFE_TIME_MIN, assignRenewTask } from "@/behavior/renew";
import taskRunner from "@/task/run";



const assignTasks = (creep: Creep) => {

  const roomName = creep.room.name;
  const room = Game.rooms[roomName];

  const roomMemory = Memory.rooms[roomName];

  /** 口袋剩余的空间 */
  const freeCapacity = creep.store.getFreeCapacity();

  /** 是否是空口袋 */
  const emptySource = creep.store.getUsedCapacity() == 0;

  /** 是否有资源 */
  const hasSource = creep.store.getUsedCapacity() > 0;

  /** 是否有能量 */
  const hasEnergy = creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0;

  // 能量未满的生产建筑
  const emptySpawn = _.cloneDeep(roomMemory.emptyStructureList)

  const storage = room.storage;

  // mineral
  const containers = room.find(FIND_STRUCTURES, {
    filter: (s) => {
      return (s.structureType === STRUCTURE_CONTAINER && s.store.getUsedCapacity() >= creep.store.getFreeCapacity())
    }
  }) as StructureContainer[]

  const tombstones = room.find(FIND_TOMBSTONES, {
    filter: (s) => s.store.getUsedCapacity() > 0
  });

  const ruins = room.find(FIND_RUINS, {
    filter: (s) => s.store.getUsedCapacity() > 0
  });


  const sourceStructure = _.cloneDeep(Memory.rooms[roomName].sourceStructure);

  const shouldRenew = CREEP_LIFE_TIME_MIN > creep.ticksToLive;


  if (shouldRenew) {
    assignRenewTask(creep);
    return
  }


  if (emptySpawn.length > 0) {
    // 如果有未满的spwan
    if (!hasEnergy) {
      // 如果storage有空间
      if (storage.store.getUsedCapacity(RESOURCE_ENERGY) > freeCapacity) {
        creep.memory.task = TaskType.take;
        creep.memory.targetId = storage.id;
      }

      // 从container里面拿
      else {
        const energyContainers = containers.filter(container => {
          container.store.getUsedCapacity(RESOURCE_ENERGY) > freeCapacity
        });

        if (energyContainers.length > 0) {
          creep.memory.task = TaskType.take
          creep.memory.targetId = energyContainers[0].id
        } else {
          creep.say('no energy container')
        }
      }
    }
    // 送到空闲的spwan
    else {
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
  }

  // 拿资源模式
  else if (emptySource && containers.length > 0) {

    containers.sort((a, b) => {
      const aSource = Game.getObjectById(a.id) as AnyStoreStructure
      const bSource = Game.getObjectById(b.id) as AnyStoreStructure
      // 根据剩余能量排序
      return bSource.store.getUsedCapacity() - aSource.store.getUsedCapacity();
    });

    creep.memory.task = TaskType.take;
    creep.memory.targetId = containers[0].id;

    const target = Game.getObjectById(creep.memory.targetId) as AnyStoreStructure;
    creep.memory.from = target.structureType;

  }
  // 送资源
  else if (hasSource) {
    creep.memory.task = TaskType.carry;
    creep.memory.targetId = storage.id;
  }


  // 从墓碑拿
  else if (tombstones.length > 0) {
    creep.memory.task = TaskType.take;
    creep.memory.targetId = tombstones[0].id;
  }

  // 从墓碑拿
  else if (ruins.length > 0) {
    creep.memory.task = TaskType.take;
    creep.memory.targetId = ruins[0].id;
  }

  else {
    console.log('无任务');
    creep.memory.task = null;
  }

}


const roleCarry = {
  run: function (creep: Creep) {
    taskRunner(creep, assignTasks)
  },
};

export default roleCarry;