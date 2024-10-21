import { showDash } from "@/var";
import { assignCarryTask } from "./carry";

export default function (creep: Creep) {
  const controller = creep.room.controller;

  if (!controller) {
    creep.memory.task = null;
    // 该房间没有控制器
    return false
  }

  const emptySource = creep.store.getUsedCapacity() == 0;

  // 如果有其他东西，先送到storage
  if (creep.store.getUsedCapacity() !== creep.store.getUsedCapacity(RESOURCE_ENERGY)) {
    assignCarryTask(creep, { targetId: creep.room.storage.id });
  }

  const res = creep.upgradeController(controller);

  if (emptySource) {
    return false;
  }

  if (res === ERR_NOT_IN_RANGE) {
    creep.moveTo(controller, showDash);
  };

}