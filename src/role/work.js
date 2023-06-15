// 特殊资源采集
import { showDash } from "../var.ts";
import roleCarry from "./carry";
// const resource = Game.getObjectById('5bbcab9b9099fc012e633f2b');
// const stroage = Game.getObjectById('60199445a8628c34e4c3bc81');

const roleHarvester = {
  run: function (creep, i) {
    const toHeal = creep.room.find(FIND_MY_CREEPS, {
      filter: (c) => c.hits < c.hitsMax,
    });

    if (toHeal.length > 0) {
      if (creep.heal(toHeal[0]) == ERR_NOT_IN_RANGE) {
        creep.moveTo(toHeal[0]);
      }
      return false;
    }
    // 应该去挖矿
    if (!creep.memory.harvest && creep.store.getFreeCapacity() == 0) {
      creep.memory.harvest = true;
    }
    // 应该去送货
    if (creep.memory.harvest && creep.store.getUsedCapacity() == 0) {
      creep.memory.harvest = false;
    }
    if (!creep.memory.harvest) {
      // creep.self_harvest(0);
      const minerals = creep.room.find(FIND_MINERALS, {
        filter: (m) => m.mineralAmount > 0,
      });
      if (minerals.length > 0) {
        if (creep.harvest(minerals[0]) === ERR_NOT_IN_RANGE) {
          creep.moveTo(minerals[0], showDash);
        }
      } else {
        // creep.self_withdraw()
        roleCarry.run(creep, 1);
      }
    } else {
      creep.sendSourceToSroage();
      // creep.sendRourceToStructure();
    }
  },
};
export default roleHarvester;
