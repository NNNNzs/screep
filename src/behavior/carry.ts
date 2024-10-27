import { TaskType } from "@/modules/Task";
import { log } from "@/utils";
import { showDash } from "@/var";

/** 从creep的store中 转移资源 */
export default function (creep: Creep) {

  if (creep.store.getUsedCapacity() == 0) {
    log('behavior/carry', '没有能量了');
    return false;
  }

  const target = Game.getObjectById(creep.memory.targetId) as StructureExtension | StructureSpawn | StructureTower;

  if (![STRUCTURE_SPAWN, STRUCTURE_TOWER, STRUCTURE_EXTENSION, STRUCTURE_STORAGE].includes(target.structureType)) {
    log('behavior/carry', '目标不是 spawn/tower/extension/storage', target.structureType);
    return false
  }

  if (target.store.getFreeCapacity() == 0) {
    log('behavior/carry', '目标已经满了');
    return false
  }

  // 转移所有能量 有一个成功则为成功
  const success = Object.keys(creep.store).some(sourceType => {

    const res = creep.transfer(target, sourceType as ResourceConstant);


    if (res === ERR_NOT_IN_RANGE) {
      // todo  这里不正确 虽然很远，但是还是要判断是不是满了
      creep.moveTo(target, showDash);
      return true;
    };

    if (res === OK) {
      return true;
    } else {
      log('behavior/carry', 'transfer res ', res, 'sourceType', sourceType);
      return false
    }
  });


  if (!success) {
    return false
  }



}

interface AssignCarryTaskParams {
  targetId: Id<AnyStoreStructure>,
  targetType: StructureConstant,
  sourceType?: ResourceConstant,
  amount?: number
}


/**
 * 
 * @param creep 
 * @param params 
 * @description 分配搬运任务 拿东西到 target 
 */
export const assignCarryTask = function (creep: Creep, params: AssignCarryTaskParams) {
  creep.memory.task = TaskType.carry;
  creep.memory.targetId = params.targetId
  creep.memory.taskType = TaskType.carry
  creep.memory.targetType = params.targetType;

  if (params.sourceType) {
    creep.memory.sourceType = params.sourceType;
  }
  if (params.amount) {
    creep.memory.amount = params.amount;
  }
}
