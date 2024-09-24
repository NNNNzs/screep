import { toBuildList } from "@/modules/structure";

export default function (creep: Creep) {
  const target = Game.getObjectById(creep.memory.targetId) as ConstructionSite;

  if (creep.store.getUsedCapacity() == 0) {
    return false
  }

  // 还没去就修满了 就不去了
  if (target.progress == target.progressTotal) {
    toBuildList();
    return false
  }

  const res = creep.build(target);

  if (res == ERR_NOT_IN_RANGE) {
    creep.moveTo(target);
  };

  // 建造完毕
  if (target.progress == target.progressTotal) {
    toBuildList();
    return false
  }

}