import { TaskType } from "@/modules/Task";
import renew, { CREEP_LIFE_TIME_MIN, assignRenewTask, shouldRenew } from "@/behavior/renew";
import taskRunner from "@/task/run";

// 新增：定义资源优先级
const RESOURCE_PRIORITY = [RESOURCE_ENERGY, RESOURCE_POWER, RESOURCE_GHODIUM, /* 其他资源类型 */];

// 新增：定义任务优先级
const TASK_PRIORITY = {
  TOWER_REFILL: 1,
  SPAWN_REFILL: 2,
  STORAGE_DEPOSIT: 3,
  COLLECT_DROPPED: 4,
  COLLECT_TOMBSTONE: 5,
  COLLECT_RUIN: 6,
  COLLECT_CONTAINER: 7,
};

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

  const dropped = room.find(FIND_DROPPED_RESOURCES, {
    filter: (s) => s.amount > 0
  });


  const sourceStructure = _.cloneDeep(Memory.rooms[roomName].sourceStructure);

  // 新增：获取所有塔
  const towers = room.find(FIND_MY_STRUCTURES, {
    filter: (s) => s.structureType === STRUCTURE_TOWER && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
  }) as StructureTower[];

  // 新增：检查是否有紧急情况（例如，塔的能量低于50%）
  const isEmergency = towers.some(tower => tower.store.getUsedCapacity(RESOURCE_ENERGY) < tower.store.getCapacity(RESOURCE_ENERGY) * 0.5);

  if (shouldRenew(creep)) {
    assignRenewTask(creep);
    return;
  }

  // 新增：紧急情况处理
  if (isEmergency && hasEnergy) {
    const emergencyTower = towers.sort((a, b) => a.store.getUsedCapacity(RESOURCE_ENERGY) - b.store.getUsedCapacity(RESOURCE_ENERGY))[0];
    creep.memory.task = TaskType.carry;
    creep.memory.targetId = emergencyTower.id;
    creep.memory.priority = TASK_PRIORITY.TOWER_REFILL;
    return;
  }

  // 修改：补充spawn能量模式
  if (emptySpawn.length > 0) {
    // 如果有未满的spwan 且有剩余空间
    if (!hasEnergy) {

      if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
        // 先送到storage
        creep.memory.task = TaskType.carry;
        creep.memory.targetId = storage.id;
        creep.memory.takeFrom = storage;
      } else {

        // 如果storage有空间
        if (storage.store.getUsedCapacity(RESOURCE_ENERGY) > freeCapacity) {
          creep.memory.task = TaskType.take;
          creep.memory.targetId = storage.id;
          creep.memory.targetType = STRUCTURE_STORAGE;
          creep.memory.takeFrom = storage;
          console.log('take from storage');
        }

        // 从container里面拿
        else {
          const energyContainers = containers.filter(container => {
            return container.store.getUsedCapacity(RESOURCE_ENERGY) > freeCapacity
          });

          if (energyContainers.length > 0) {
            creep.memory.task = TaskType.take
            creep.memory.targetId = energyContainers[0].id
            creep.memory.takeFrom = energyContainers[0];
            creep.memory.targetType = STRUCTURE_CONTAINER
          } else {
            creep.say('no energy container')
          }
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
      creep.memory.priority = TASK_PRIORITY.SPAWN_REFILL;
    }

  }

  // 修改：拿资源模式
  else if (emptySource) {
    // 新增：考虑Link结构
    const links = room.find(FIND_MY_STRUCTURES, {
      filter: (s) => s.structureType === STRUCTURE_LINK && s.store.getUsedCapacity(RESOURCE_ENERGY) > 0
    }) as StructureLink[];

    if (links.length > 0) {
      const closestLink = creep.pos.findClosestByPath(links);
      creep.memory.task = TaskType.take;
      creep.memory.targetId = closestLink.id;
      creep.memory.takeFrom = closestLink;
      creep.memory.targetType = STRUCTURE_LINK;
    } else if (containers.length > 0) {
      // 修改：根据资源优先级排序
      containers.sort((a, b) => {
        const aValue = RESOURCE_PRIORITY.findIndex(r => a.store.getUsedCapacity(r) > 0);
        const bValue = RESOURCE_PRIORITY.findIndex(r => b.store.getUsedCapacity(r) > 0);
        return aValue - bValue || b.store.getUsedCapacity() - a.store.getUsedCapacity();
      });

      const target = containers[0];
      creep.memory.task = TaskType.take;
      creep.memory.targetId = target.id;
      creep.memory.takeFrom = target;
      creep.memory.targetType = STRUCTURE_CONTAINER;
      creep.memory.priority = TASK_PRIORITY.COLLECT_CONTAINER;
    }
  }

  // 修改：送资源
  else if (hasSource) {
    // 新增：考虑能量平衡
    const storageEnergy = storage.store.getUsedCapacity(RESOURCE_ENERGY);
    const terminalEnergy = room.terminal ? room.terminal.store.getUsedCapacity(RESOURCE_ENERGY) : 0;

    if (storageEnergy < 100000 && (!room.terminal || terminalEnergy > 50000)) {
      creep.memory.task = TaskType.carry;
      creep.memory.targetId = storage.id;
      creep.memory.priority = TASK_PRIORITY.STORAGE_DEPOSIT;
    } else if (room.terminal && terminalEnergy < 50000) {
      creep.memory.task = TaskType.carry;
      creep.memory.targetId = room.terminal.id;
      creep.memory.priority = TASK_PRIORITY.STORAGE_DEPOSIT;
    } else {
      // 如果storage和terminal都足够，考虑给其他建筑补充能量
      const needEnergyStructures = room.find(FIND_MY_STRUCTURES, {
        filter: (s) => (s.structureType === STRUCTURE_EXTENSION || s.structureType === STRUCTURE_SPAWN) &&
          s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
      });
      if (needEnergyStructures.length > 0) {
        const closest = creep.pos.findClosestByPath(needEnergyStructures);
        creep.memory.task = TaskType.carry;
        creep.memory.targetId = closest.id;
        creep.memory.priority = TASK_PRIORITY.STORAGE_DEPOSIT;
      }
    }
  }

  // 从墓碑拿
  else if (tombstones.length > 0) {
    creep.memory.task = TaskType.take;
    creep.memory.targetId = tombstones[0].id;
    creep.memory.targetType = Tombstone;
  }

  // 从墓碑拿
  else if (ruins.length > 0) {
    creep.memory.task = TaskType.take;
    creep.memory.targetId = ruins[0].id;
    creep.memory.targetType = Ruin;
  }

  // 掉在地上的资源
  else if (dropped.length > 0) {
    creep.memory.task = TaskType.take;
    creep.memory.targetId = dropped[0].id;
    creep.memory.targetType = Resource;
  }



  else {
    console.log('无任务');
    creep.memory.task = TaskType.wait;
    creep.memory.waitTime = Game.time + 10;
  }
}

const roleCarry = {
  run: function (creep: Creep) {
    taskRunner(creep, assignTasks)
  },
};

export default roleCarry;
