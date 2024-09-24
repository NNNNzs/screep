import { showDash } from "@/var";

export default function (creep: Creep) {
  const controller = creep.room.controller;

  if (!controller) {
    creep.memory.task = null;
    // 该房间没有控制器
    return false
  }

  const emptySource = creep.store.getUsedCapacity() == 0;

  const res = creep.upgradeController(controller);

  if (emptySource) {
    return false;
  }

  if (res === ERR_NOT_IN_RANGE) {
    creep.moveTo(controller, showDash);
  };

}