import { TaskType } from "@/modules/Task";
import renew, { CREEP_LIFE_TIME_MIN, assignRenewTask, shouldRenew } from "@/behavior/renew";
import taskRunner from "@/task/run";

/**
 * 搬运工
 * 1. 如果口袋中有非 RESOURCE_ENERGY 的资源，优先将非 RESOURCE_ENERGY 的资源转移到存储中
 * 2. 如果有空的生产建筑，优先将非 RESOURCE_ENERGY 的资源转移到生产建筑中 
 * 3. 
 */

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
  const roomName = creep.room.name; // 获取当前房间名称
  const room = Game.rooms[roomName]; // 获取当前房间对象
  const roomMemory = Memory.rooms[roomName]; // 获取当前房间内存

  const freeCapacity = creep.store.getFreeCapacity(); // 获取口袋剩余容量
  const emptySource = creep.store.getUsedCapacity() === 0; // 检查是否为空口袋
  const hasEnergy = creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0; // 检查是否有能量

  const emptySpawn = _.cloneDeep(roomMemory.emptyStructureList); // 获取空闲的生产建筑列表
  const storage = room.storage; // 获取存储结构

  // 获取可用的容器
  const containers = room.find(FIND_STRUCTURES, {
    filter: (s) => s.structureType === STRUCTURE_CONTAINER && s.store.getUsedCapacity() >= creep.store.getFreeCapacity()
  }) as StructureContainer[];

  // 获取可用的塔
  const towers = room.find(FIND_MY_STRUCTURES, {
    filter: (s) => s.structureType === STRUCTURE_TOWER && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
  }) as StructureTower[];

  // 检查是否存在紧急情况（塔的能量低于50%）
  const isEmergency = towers.some(tower => tower.store.getUsedCapacity(RESOURCE_ENERGY) < tower.store.getCapacity(RESOURCE_ENERGY) * 0.5);

  // 检查是否需要续命
  if (shouldRenew(creep)) {
    assignRenewTask(creep); // 分配续命任务
    return;
  }

  // 紧急情况处理
  if (isEmergency && hasEnergy) {
    // 找到能量最少的塔并分配任务
    const emergencyTower = towers.sort((a, b) => a.store.getUsedCapacity(RESOURCE_ENERGY) - b.store.getUsedCapacity(RESOURCE_ENERGY))[0];
    creep.memory.task = TaskType.carry; // 设置任务为搬运
    creep.memory.targetId = emergencyTower.id; // 设置目标为紧急塔
    creep.memory.priority = TASK_PRIORITY.TOWER_REFILL; // 设置任务优先级
    return;
  }

  // 补充生产建筑能量
  if (emptySpawn.length > 0) {
    if (!hasEnergy) { // 如果没有能量
      if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
        // 口袋已满，送资源到存储
        creep.memory.task = TaskType.carry;
        creep.memory.targetId = storage.id;
        creep.memory.takeFrom = storage;
      } else if (storage.store.getUsedCapacity(RESOURCE_ENERGY) > freeCapacity) {
        // 如果存储有空间，从存储取能量
        creep.memory.task = TaskType.take;
        creep.memory.targetId = storage.id;
        creep.memory.targetType = STRUCTURE_STORAGE;
        creep.memory.takeFrom = storage;
      } else {
        // 从容器中取能量
        const energyContainers = containers.filter(container => container.store.getUsedCapacity(RESOURCE_ENERGY) > freeCapacity);
        if (energyContainers.length > 0) {
          creep.memory.task = TaskType.take; // 设置任务为取能量
          creep.memory.targetId = energyContainers[0].id; // 设置目标为第一个可用容器
          creep.memory.takeFrom = energyContainers[0];
          creep.memory.targetType = STRUCTURE_CONTAINER;
        } else {
          creep.say('no energy container'); // 如果没有可用容器，发出提示
        }
      }
    } else {
      // 如果有能量，送到空闲的生产建筑
      const freeSpawn = emptySpawn.sort((a, b) => {
        const aSource = Game.getObjectById(a) as StructureExtension;
        const bSource = Game.getObjectById(b) as StructureExtension;
        return aSource.pos.getRangeTo(creep.pos) - bSource.pos.getRangeTo(creep.pos); // 返回距离最近的生产建筑
      });

      creep.memory.task = TaskType.carry; // 设置任务为搬运
      creep.memory.targetId = freeSpawn[0]; // 设置目标为最近的空闲生产建筑
      creep.memory.priority = TASK_PRIORITY.SPAWN_REFILL; // 设置任务优先级
    }
  } else if (emptySource) { // 如果口袋为空
    // 获取可用的链接结构
    const links = room.find(FIND_MY_STRUCTURES, {
      filter: (s) => s.structureType === STRUCTURE_LINK && s.store.getUsedCapacity(RESOURCE_ENERGY) > 0
    }) as StructureLink[];

    if (links.length > 0) {
      // 从最近的链接结构取能量
      const closestLink = creep.pos.findClosestByPath(links);
      creep.memory.task = TaskType.take; // 设置任务为取能量
      creep.memory.targetId = closestLink.id; // 设置目标为链接结构
      creep.memory.takeFrom = closestLink;
      creep.memory.targetType = STRUCTURE_LINK;
    } else if (containers.length > 0) {
      // 从容器中取能量，按资源优先级排序
      containers.sort((a, b) => {
        const aValue = RESOURCE_PRIORITY.findIndex(r => a.store.getUsedCapacity(r) > 0);
        const bValue = RESOURCE_PRIORITY.findIndex(r => b.store.getUsedCapacity(r) > 0);
        return aValue - bValue || b.store.getUsedCapacity() - a.store.getUsedCapacity();
      });

      const target = containers[0]; // 选择优先级最高的容器
      creep.memory.task = TaskType.take; // 设置任务为取能量
      creep.memory.targetId = target.id; // 设置目标为容器
      creep.memory.takeFrom = target;
      creep.memory.targetType = STRUCTURE_CONTAINER;
      creep.memory.priority = TASK_PRIORITY.COLLECT_CONTAINER; // 设置任务优先级
    }
  } else if (hasEnergy) { // 如果有能量
    const storageEnergy = storage.store.getUsedCapacity(RESOURCE_ENERGY); // 获取存储能量
    const terminalEnergy = room.terminal ? room.terminal.store.getUsedCapacity(RESOURCE_ENERGY) : 0; // 获取终端能量

    // 判断存储和终端的能量情况，决定送资源的目标
    if (storageEnergy < 100000 && (!room.terminal || terminalEnergy > 50000)) {
      creep.memory.task = TaskType.carry; // 设置任务为搬运
      creep.memory.targetId = storage.id; // 设置目标为存储
      creep.memory.priority = TASK_PRIORITY.STORAGE_DEPOSIT; // 设置任务优先级
    } else if (room.terminal && terminalEnergy < 50000) {
      creep.memory.task = TaskType.carry; // 设置任务为搬运
      creep.memory.targetId = room.terminal.id; // 设置目标为终端
      creep.memory.priority = TASK_PRIORITY.STORAGE_DEPOSIT; // 设置任务优先级
    } else {
      // 如果存储和终端都足够，寻找其他建筑补充能量
      const needEnergyStructures = room.find(FIND_MY_STRUCTURES, {
        filter: (s) => (s.structureType === STRUCTURE_EXTENSION || s.structureType === STRUCTURE_SPAWN) &&
          s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
      });
      if (needEnergyStructures.length > 0) {
        const closest = creep.pos.findClosestByPath(needEnergyStructures); // 找到最近的需要能量的建筑
        creep.memory.task = TaskType.carry; // 设置任务为搬运
        creep.memory.targetId = closest.id; // 设置目标为需要能量的建筑
        creep.memory.priority = TASK_PRIORITY.STORAGE_DEPOSIT; // 设置任务优先级
      }
    }
  } else {
    handleTombstonesAndRuins(creep); // 处理墓碑和遗迹
  }

  // 无任务处理
  if (!creep.memory.task) {
    console.log('无任务'); // 输出无任务
    creep.memory.task = TaskType.wait; // 设置任务为等待
    creep.memory.waitTime = Game.time + 10; // 设置等待时间
  }
}

// 处理墓碑和遗迹的函数
const handleTombstonesAndRuins = (creep: Creep) => {
  const tombstones = creep.room.find(FIND_TOMBSTONES, {
    filter: (s) => s.store.getUsedCapacity() > 0
  });

  const ruins = creep.room.find(FIND_RUINS, {
    filter: (s) => s.store.getUsedCapacity() > 0
  });

  if (tombstones.length > 0) {
    creep.memory.task = TaskType.take;
    creep.memory.targetId = tombstones[0].id;
    creep.memory.targetType = Tombstone;
  } else if (ruins.length > 0) {
    creep.memory.task = TaskType.take;
    creep.memory.targetId = ruins[0].id;
    creep.memory.targetType = Ruin;
  } else {
    const dropped = creep.room.find(FIND_DROPPED_RESOURCES, {
      filter: (s) => s.amount > 0
    });
    if (dropped.length > 0) {
      creep.memory.task = TaskType.take;
      creep.memory.targetId = dropped[0].id;
      creep.memory.targetType = Resource;
    }
  }
}


const roleCarry = {
  run: function (creep: Creep) {
    taskRunner(creep, assignTasks)
  },
};

export default roleCarry;
