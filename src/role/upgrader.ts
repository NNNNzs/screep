const showDash = { visualizePathStyle: { stroke: "#fffff" } };


/**
 * 1. 
 */
const upgrader = {
  run: function (creep: Creep) {
    // 如果正在升级，且携带的资源没有了
    if (creep.memory.working && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.working = false;
      creep.say("🔄 harvest");
    }
    // 如果不在升级，且剩余存储空间为0
    if (!creep.memory.working && creep.store.getFreeCapacity() == 0) {
      creep.memory.working = true;
      creep.say("⚡ upgrade");
    }

    if (creep.memory.working) {
      if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller, showDash);
      }
    } else {
      // creep.getResourceByStructure();
    }
  },
};

export default upgrader;
