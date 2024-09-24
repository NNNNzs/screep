import { toFixedList } from "@/modules/structure";


export default function (creep: Creep) {
  const target = Game.getObjectById(creep.memory.targetId) as Structure;

  if (creep.store.getUsedCapacity() == 0) {
    return false
  }

  // 还没去就修满了 就不去了
  if (target.hits == target.hitsMax) {
    toFixedList();
    return false
  }

  const res = creep.repair(target);

  if (res === ERR_NOT_IN_RANGE) {
    creep.moveTo(target);
  }

  if (res == ERR_NOT_ENOUGH_RESOURCES) {
    return false
  }

  // 修完了
  if (target.hits == target.hitsMax) {
    toFixedList();
    return false
  }
}
