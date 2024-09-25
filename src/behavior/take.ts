import { log } from "@/utils";

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

    log('take', sourceType, res)


    if (res == ERR_NOT_IN_RANGE) {
      creep.moveTo(target);
      return true;
    };

    if (res === OK) {
      return true;
    }

    const errStatus = [ERR_NOT_ENOUGH_RESOURCES, ERR_FULL] as ScreepsReturnCode[]

    if (errStatus.includes(res)) {
      console.log('take error', res)
      // return false
    }
  })

  if (!success) {
    return false
  }
}