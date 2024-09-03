// 特殊资源采集
import { showDash } from "../var.js";
import roleCarry from "./carry.js";

/** 已经发布的任务的id，一般是建筑id */
const taskIdSet = new Set<string>();
const taskList = [];

const roleHarvester = {
  run: function (creep: Creep) {

    if (!creep.memory.task) {

      // 挖矿判断
      if (creep.store.getFreeCapacity() == 0) {
        const sources = creep.room.find(FIND_SOURCES, {
          filter: (s: Source) => s.energy > 0,
        });

        if (sources.length !== 0) {
          creep.memory.task = 'harvest';
          creep.memory.targetId = sources[0].id;
        }
      }
      // 
      if (creep.store.getUsedCapacity() == 0) {
        creep.memory.task = 'carry';
      };

    }

    const task = creep.memory.task;
    if (task === 'harvest') {
      const target = Game.getObjectById(creep.memory.targetId) as Source;

      const res = creep.harvest(target);

      if (res === ERR_NOT_IN_RANGE) {
        creep.moveTo(target, showDash);
      }

      if (creep.store.getUsedCapacity() == 0) {
        creep.memory.task = 'carry';
      }

      // 判断如果是采集完了，就切换任务
      if (target.energy == 0) {
        creep.memory.task = 'carry';
      }
    }

    else if (task === 'carry') {
      // creep.sendRourceToStructure()
    }

  },
};
export default roleHarvester;
