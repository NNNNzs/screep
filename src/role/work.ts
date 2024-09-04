// 特殊资源采集
import { showDash } from "../var.js";
import { creepExtension } from "../modules/mount.js";

/** 已经发布的任务的id，一般是建筑id */
const taskIdSet = new Set<string>();
const taskList = [];

const roleHarvester = {
  run: function (creep: Creep) {

    if (!creep.memory.task) {

      // 挖矿判断
      if (creep.store.getUsedCapacity() == 0) {
        const sources = creep.room.find(FIND_SOURCES, {
          filter: (s: Source) => s.energy > 0,
        });

        if (sources.length !== 0) {
          creep.memory.task = 'harvest';
          creep.memory.targetId = sources[0].id;
        }
      }

      //送货判断 
      else if (creep.store.getFreeCapacity() == 0) {
        creep.memory.task = 'carry';
      };

      // 升级控制器判断

    }

    const task = creep.memory.task;

    if (task === 'harvest') {
      const target = Game.getObjectById(creep.memory.targetId) as Source;
      if (!target) {
        creep.memory.task = null;
        return
      }

      const res = creep.harvest(target);

      if (res === ERR_NOT_IN_RANGE) {
        creep.moveTo(target, showDash);
      }

      if (creep.store.getFreeCapacity() == 0) {
        creep.memory.task = 'carry';
      };

      // 判断如果是采集完了，就切换任务
      if (target.energy == 0) {
        creep.memory.task = 'carry';
      }
    }

    else if (task === 'carry') {
      if (creep.store.getUsedCapacity() == 0) {
        creep.memory.task = null;
        console.log('背包已满');
      }
      // 送货
      const empty = creepExtension.sendRourceToStructure.call(creep);
      if (empty) {
        creep.memory.task = 'upgrade';
        console.log('升级控制器');
      }
    } else if (task === 'upgrade') {

      const controller = creep.room.controller;

      if (!controller) {
        creep.memory.task = null;
        // 该房间没有控制器
        return
      }
      if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
        creep.moveTo(controller, showDash);
      }
      if (creep.store.getUsedCapacity() == 0) {
        creep.memory.task = null;
      }
    }

  },
};
export default roleHarvester;
