import { log } from "@/utils";
import { TaskType } from "@/modules/Task";
/** 从target里面拿出资源 */
export default function (creep: Creep) {

  // 有可能是建筑类型
  const target = Game.getObjectById(creep.memory.targetId) as AnyStoreStructure;
  // console.log('typeof target', typeof target)

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



  // 有可能是掉落在地上的资源

  // 判断是不是掉在地上的资源类型

  const success = Object.keys(target.store).some(sourceType => {

    const res = creep.withdraw(target, sourceType as ResourceConstant);


    if (res == ERR_NOT_IN_RANGE) {
      creep.moveTo(target);
      return true;
    };

    if (res === OK) {
      return true;
    } else {
      log('take', sourceType, res)
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
  targetType: StructureConstant | Tombstone | Ruin | Resource,
  takeFrom: AnyStoreStructure | Tombstone | Ruin | Resource
}

/** 从 target中拿东西  */
export const assignTakeTask = (creep: Creep, params: AssignTakeTaskParams) => {
  creep.memory.targetId = params.targetId;
  creep.memory.task = params.taskType;
  creep.memory.targetType = params.targetType;
  creep.memory.takeFrom = params.takeFrom;
  return true;
}
