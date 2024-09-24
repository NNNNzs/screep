/** 从target里面拿出资源 */
export default function (creep: Creep) {
  const target = Game.getObjectById(creep.memory.targetId) as AnyStoreStructure;

  const res = creep.withdraw(target, RESOURCE_ENERGY);

  if (res == ERR_NOT_IN_RANGE) {
    creep.moveTo(target);
  };

  const errStatus = [ERR_NOT_ENOUGH_RESOURCES, ERR_FULL] as ScreepsReturnCode[]

  if (errStatus.includes(res)) {
    return false
  }

}