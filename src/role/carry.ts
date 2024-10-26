import { TaskType } from "@/modules/Task";
import renew, { CREEP_LIFE_TIME_MIN, assignRenewTask, shouldRenew } from "@/behavior/renew";
import taskRunner from "@/task/run";
import { log, sortByRange, sortByUsedCapacity } from "@/utils";
import { assignTakeTask } from "@/behavior/take";

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

  const storage = room.storage; // 获取存储结构

  const freeCapacity = creep.store.getFreeCapacity(); // 获取口袋剩余容量
  // 检查是否为空口袋
  const emptySource = creep.store.getUsedCapacity() === 0;
  // 检查是否有资源
  const hasResource = creep.store.getUsedCapacity() > 0;
  // 检查是否有能量
  const hasEnergy = hasResource && creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0;
  // 检查是否有其他资源
  const hasOtherResource = hasResource && creep.store.getUsedCapacity() !== creep.store.getUsedCapacity(RESOURCE_ENERGY);

  // 获取空闲的生产建筑列表
  const emptySpawn = _.cloneDeep(roomMemory.emptyStructureList);

  /** 有空的生产队列 */
  const hasEmptySpawn = emptySpawn.length > 0;



  // 获取可用的塔
  const towers = room.find(FIND_MY_STRUCTURES, {
    filter: (s) => s.structureType === STRUCTURE_TOWER && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
  }) as StructureTower[];


  // 检查是否存在紧急情况（塔的能量低于50%）
  const hasEmergency = towers.some(tower => tower.store.getUsedCapacity(RESOURCE_ENERGY) < tower.store.getCapacity(RESOURCE_ENERGY) * 0.5);

  // 需要优先补充能量
  const needCarryEnergy = hasEmptySpawn || hasEmergency;





  /** 从桶中取能量 */
  const getFromStorage = (sourceType?: ResourceConstant) => {
    const storageEnergy = storage.store.getUsedCapacity(sourceType); // 获取存储能量
    if (storageEnergy > 0) {
      
      assignTakeTask(creep, {
        targetId: storage.id,
        taskType: TaskType.take,
        targetType: STRUCTURE_STORAGE,
        sourceType: sourceType,
        takeFrom: storage
      })
      creep.say('getFromStorage success');

      return true;
    } else {
      creep.say('getFromStorage fail');
      return false;
    }
  }

  /** 从容器中取能量 */
  const getFromContainer = (sourceType?: ResourceConstant) => {

    // return false;
    // 获取可用的容器
    const containers = room.find(FIND_STRUCTURES, {
      filter: (s) => s.structureType === STRUCTURE_CONTAINER && s.store.getUsedCapacity(sourceType) >= 0
    }) as StructureContainer[];

    if (containers.length > 0) {
      sortByUsedCapacity(containers, { orderBy: 'desc' })
      const target = containers[0];

      assignTakeTask(creep, {
        targetId: target.id,
        taskType: TaskType.take,
        targetType: STRUCTURE_CONTAINER,
        sourceType: sourceType,
        takeFrom: target
      })

      log('behavior/carry/getFromContainer', 'take from', STRUCTURE_CONTAINER)


      return true;
    } else {
      creep.say('no energy container'); // 如果没有可用容器，发出提示
      return false;
    }
  };

  /** 从墓碑和遗迹中取资源 */
  const getFromTombstonesAndRuins = () => {

    const tombstones = creep.room.find(FIND_TOMBSTONES, {
      filter: (s) => s.store.getUsedCapacity() > 0
    });

    const ruins = creep.room.find(FIND_RUINS, {
      filter: (s) => s.store.getUsedCapacity() > 0
    });

    const dropped = creep.room.find(FIND_DROPPED_RESOURCES, {
      filter: (s) => s.amount > 0
    });

    log('behavior/carry/getFromTombstonesAndRuins', 'tombstones', tombstones, 'ruins', ruins, 'dropped', dropped)

    if (tombstones.length > 0) {

      const target = tombstones[0];

      assignTakeTask(creep, {
        targetId: target.id,
        taskType: TaskType.take,
        targetType: target,
        takeFrom: target
      })


      return true;
    }
    else if (ruins.length > 0) {
      const target = ruins[0];
      assignTakeTask(creep, {
        targetId: target.id,
        taskType: TaskType.take,
        targetType: target,
        takeFrom: target
      })


      return true;
    } else if (dropped.length > 0) {
      const target = dropped[0];
      assignTakeTask(creep, {
        targetId: target.id,
        taskType: TaskType.take,
        targetType: target,
        takeFrom: target
      })
      return true;
    }

    return false;
  }

  const sendToSpawn = () => {
    const freeSpawn = emptySpawn.sort((a, b) => {
      const aSource = Game.getObjectById(a) as StructureExtension;
      const bSource = Game.getObjectById(b) as StructureExtension;
      return aSource.pos.getRangeTo(creep.pos) - bSource.pos.getRangeTo(creep.pos); // 返回距离最近的生产建筑
    });

    creep.memory.task = TaskType.carry; // 设置任务为搬运
    creep.memory.targetId = freeSpawn[0]; // 设置目标为最近的空闲生产建筑
    creep.memory.priority = TASK_PRIORITY.SPAWN_REFILL; // 设置任务优先级
  }

  const sendToStorage = () => {
    creep.memory.task = TaskType.carry; // 设置任务为搬运
    creep.memory.targetId = storage.id; // 设置目标为存储
    creep.memory.priority = TASK_PRIORITY.STORAGE_DEPOSIT; // 设置任务优先级
  }

  const sendToTower = () => {
    const towers = room.find(FIND_MY_STRUCTURES, {
      filter: (s) => s.structureType === STRUCTURE_TOWER && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
    }) as StructureTower[];
    sortByRange(creep.pos, towers);
    creep.memory.task = TaskType.carry;
    creep.memory.targetId = towers[0].id;
    creep.memory.priority = TASK_PRIORITY.TOWER_REFILL;
  }

  const watiSomeTime = () => {
    log('behavior/carry/watiSomeTime', '无任务')
    creep.memory.task = TaskType.wait; // 设置任务为等待
    creep.memory.waitTime = Game.time + 10; // 设置等待时间
  }


  if (hasResource) { // 检查是否有资源
    if (hasEnergy) { // 检查是否有能量
      if (hasEmergency) { // 检查是否处于紧急状态
        sendToTower() // 发送到塔
      } else {
        if (hasEmptySpawn) { // 检查是否有空的生成点
          sendToSpawn() // 发送到生成点
        } else {
          sendToStorage() // 否则发送到存储
        }
      }
    } else {
      sendToStorage() // 如果没有能量，发送到存储
    }
  }
  else { // 如果没有资源
    if (needCarryEnergy) { // 检查是否需要携带能量
      creep.say('need carry energy');
      // 不能从桶里拿
      if (getFromStorage(RESOURCE_ENERGY)) {
        creep.say('getFromStorage');
      } // 尝试从存储获取能量
      // 不能从容器里拿
      else if (getFromContainer(RESOURCE_ENERGY)) { // 尝试从容器获取能量
        creep.say('getFromContainer');
      } else {
        creep.say('watiSomeTime');
        watiSomeTime() // 如果都不能获取，等待一段时间
      }
    }
    else if (shouldRenew(creep)) { // 检查是否需要更新 creep
      log('behavior/carry/shouldRenew', 'should renew')
      assignRenewTask(creep); // 分配更新任务
    }
    // 尝试从墓碑和废墟获取能量
    else if (getFromTombstonesAndRuins()) {
      log('behavior/carry/getFromTombstonesAndRuins', 'getFromTombstonesAndRuins success');
    }
    else if (getFromContainer()) { // 再次尝试从容器获取能量
      log('behavior/carry/getFromContainer', 'getFromContainer success');
    } else {
      watiSomeTime() // 如果都不能获取，等待一段时间
    }
  }


}



const roleCarry = {
  run: function (creep: Creep) {
    taskRunner(creep, assignTasks)
  },
};

export default roleCarry;
