import { TaskItem, TaskType, TaskStatus } from "@/modules/Task";
import { log } from "@/utils";
import { showDash } from "@/var";

/** 从source转移资源到target */
export default function (creep: Creep) {

  if (creep.store.getFreeCapacity() == 0) {
    log('behavior/transfer', 'creep的存储已满');
    return false;
  }

  const source = Game.getObjectById(creep.memory.sourceId) as AnyStoreStructure;
  const target = Game.getObjectById(creep.memory.targetId) as AnyStoreStructure;

  if (!source || !target) {
    log('behavior/transfer', '无效的source或target');
    return false;
  }

  if (source.store.getUsedCapacity(creep.memory.sourceType) == 0) {
    log('behavior/transfer', 'source没有足够的资源');
    return false;
  }

  if (target.store.getFreeCapacity(creep.memory.sourceType) == 0) {
    log('behavior/transfer', 'target没有足够的存储空间');
    return false;
  }
  // 转移的资源数量
  const amount = Math.min(creep.memory.amount || Infinity, source.store.getUsedCapacity(creep.memory.sourceType), creep.store.getFreeCapacity());


  // 先拿资源
  if (!creep.memory.takeOk) {
    const res = creep.withdraw(source, creep.memory.sourceType, amount);

    if (res === ERR_NOT_IN_RANGE) {
      creep.moveTo(source, showDash);
      return true;
    } else if (res === OK) {
      creep.memory.takeOk = true;
      return false;
    } else {
      log('behavior/transfer', 'withdraw res', res);
    }
  } else {
    const transferAmount = Math.min(amount, target.store.getFreeCapacity(creep.memory.sourceType));
    // 再转移
    const transferRes = creep.transfer(target, creep.memory.sourceType, transferAmount);

    if (transferRes === ERR_NOT_IN_RANGE) {
      creep.moveTo(target, showDash);
      return true;
    } else if (transferRes !== OK) {
      log('behavior/transfer', 'transfer res', transferRes);
      return false;
    }
  }

  return true;
}

interface AssignTransferTaskParams extends TaskItem {
  sourceId: Id<AnyStoreStructure>,
  targetId: Id<AnyStoreStructure>,
  params: {
    sourceType: ResourceConstant,
    amount?: number
  }
}

/**
 * 
 * @param creep 
 * @param params 
 * @description 分配转移任务 从source拿东西到target
 */
export const assignTransferTask = function (creep: Creep, params: AssignTransferTaskParams) {

  creep.memory.task = TaskType.transfer;
  creep.memory.sourceId = params.sourceId;
  creep.memory.targetId = params.targetId;
  creep.memory.takeOk = false;

  const taskList = Memory.taskList;

  const task = taskList.find(task => task.id === params.id);
  if (task) {
    task.executorId = [creep.id];
    task.status = TaskStatus.RUNNING;
  }
};

export const createTransferTask = function (params: AssignTransferTaskParams) {
  if (!Memory.taskList) {
    Memory.taskList = [];
  }
  const taskList = Memory.taskList;
  const taskId = `${params.sourceId}-${params.targetId}-${params.params.sourceType}`;
  params.id = taskId;

  const task = params;
  task.type = TaskType.transfer;
  task.status = TaskStatus.READY;
  task.executorId = [];
  task.orderNum = 0;
  task.params = {
    sourceType: params.params.sourceType,
    amount: params.params.amount
  }

  taskList.push(task);
};

global.createTransferTask = createTransferTask;