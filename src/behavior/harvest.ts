import { showDash } from "../var.js";

export default function (creep: Creep) {
  const target = Game.getObjectById(creep.memory.targetId) as Source;

  const res = creep.harvest(target);

  if (res === ERR_NOT_IN_RANGE) {
    creep.moveTo(target, showDash);
  }

  if (res === ERR_INVALID_TARGET) {
    return false;
  }

  if (creep.store.getFreeCapacity() == 0) {
    return false
  };

  // 判断如果是采集完了，就切换任务
  if (target.energy == 0) {
    return false;
  }
};