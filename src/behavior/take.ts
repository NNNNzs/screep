import { log } from "@/utils";
import { TaskType } from "@/modules/Task";
/** 从target里面拿出资源 */
export default function (creep: Creep) {

  // 有可能是建筑类型
  const target = Game.getObjectById(creep.memory.targetId) as AnyStoreStructure;

  if (!target) {
    log.warn('behavior/take1', 'target not found', creep.memory.targetId)
    return false
  }

  if (target instanceof Resource) {
    const res = creep.pickup(target);
    if (res == ERR_NOT_IN_RANGE) {
      creep.moveTo(target);
      return
    } else if (res == OK) {

    }
    else {
      log('take error', res)
      return false
    }
  }
  // log.warn('behavior/take2', 'target', target, target.store,)

  // 如果有指定资源类型 则直接取指定资源类型
  if (creep.memory.sourceType) {
    const sourceType = creep.memory.sourceType;
    const res = creep.withdraw(target, sourceType as ResourceConstant);
    if (res == ERR_NOT_IN_RANGE) {
      creep.moveTo(target);
      return true;
    };

    if (target.store.getUsedCapacity() < 50) {
      // 如果目标仓库容量小于50，则不继续取资源
      // 因为如果目标仓库容量小于50，则目标仓库已经满了，再取资源也没有意义
      log('behavior/take/withdraw', 'target store used capacity', target.store.getUsedCapacity())
      return false
    }

    if (res === OK) {
      return true;
    } else {
      log('take', sourceType, res)
      return false;
    }
  }






  // 有可能是掉落在地上的资源

  // 判断是不是掉在地上的资源类型

  // return 
  // log.warn('behavior/take4', 'target', target, target.store)
  const success = Object.keys(target.store).some(sourceType => {




    const res = creep.withdraw(target, sourceType as ResourceConstant);
    if (res == ERR_NOT_IN_RANGE) {
      creep.moveTo(target);
      return true;
    };

    if (res === OK) {
      return true;
    } else {
      // log.warn('behavior/take5', 'target', creep, target, target.store, sourceType)
      return false;
    }





  });

  if (!success) {
    return false
  }
}

interface AssignTakeTaskParams {
  targetId: Id<AnyStoreStructure> | Id<Tombstone> | Id<Ruin> | Id<Resource>,
  taskType: TaskType.take,
  sourceType?: ResourceConstant,
  targetType: StructureConstant | Tombstone | Ruin | Resource,
  takeFrom: AnyStoreStructure | Tombstone | Ruin | Resource
}

/** 从 target中拿东西  */
export const assignTakeTask = (creep: Creep, params: AssignTakeTaskParams) => {
  creep.memory.targetId = params.targetId;
  creep.memory.task = params.taskType;
  creep.memory.targetType = params.targetType;
  creep.memory.takeFrom = params.takeFrom;
  creep.memory.sourceType = params.sourceType;
  return true;
}
