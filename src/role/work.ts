// 特殊资源采集
import { showDash } from "../var.js";
import { creepExtension } from "../modules/mount.js";
import { findEmptyStructure } from "@/utils";

const roleHarvester = {
  run: function (creep: Creep) {

    if (!creep.memory.task) {

      const hasSource = creep.store.getFreeCapacity() == 0;
      const roomMemory = Memory.rooms[creep.room.name];
      const index = Object.keys(Game.creeps).indexOf(creep.name);
      const emptySpawn = findEmptyStructure(creep, [STRUCTURE_SPAWN, STRUCTURE_EXTENSION]);

      // 挖矿判断
      if (creep.store.getUsedCapacity() == 0) {
        // 这里应该替换成没有harvester的资源矿
        const sources = creep.room.find(FIND_SOURCES, {
          filter: (s: Source) => s.energy > 0,
        });

        if (sources.length !== 0) {
          creep.memory.task = 'harvest';
          const creepIndex = index % sources.length;
          creep.memory.targetId = sources[creepIndex].id;
        }
      }

      // 如果有空的spawn extension，优先送货
      else if (hasSource && emptySpawn.length > 0) {
        creep.memory.task = 'carry';
      }

      // 至少保留一个去升级
      else if (hasSource && index === 0) {
        creep.memory.task = 'upgrade';
      }

      // 修理判断
      else if (hasSource && roomMemory.toFixedStructures.length > 0) {
        creep.memory.task = 'repair';
        creep.memory.targetId = roomMemory.toFixedStructures[0].id;
      }

      // 建造判断
      else if (hasSource && Memory.rooms[creep.room.name].toConstructionSite.length > 0) {
        creep.memory.task = 'build';
        creep.memory.targetId = Memory.rooms[creep.room.name].toConstructionSite[0].id;
      }

      //送货判断 
      else if (creep.store.getFreeCapacity() == 0) {
        creep.memory.task = 'carry';
      }

      // 冗余去升级 
      else {
        creep.memory.task = 'upgrade';
      }
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


      if (res === -7) {
        creep.memory.targetId = null;
      }

      if (creep.store.getFreeCapacity() == 0) {
        creep.memory.task = null;
      };

      // 判断如果是采集完了，就切换任务
      if (target.energy == 0) {
        creep.memory.task = null;
      }

    }

    else if (task === 'carry') {
      if (creep.store.getUsedCapacity() == 0) {
        creep.memory.task = null;
        return;
      }
      const empty = creepExtension.sendRourceToStructure.call(creep);
      if (empty) {
        console.log('所有建筑都满了');
        creep.memory.task = null;
      }
    }
    else if (task === 'upgrade') {
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

    else if (task === 'repair') {
      const target = Game.getObjectById(creep.memory.targetId) as Structure;
      if (!target) {
        creep.memory.task = null;
        creep.memory.targetId = null;
        return
      }

      if (creep.store.getUsedCapacity() == 0) {
        creep.memory.task = 'harvest';
        creep.memory.targetId = null;
        return
      }

      if (creep.repair(target) == ERR_NOT_IN_RANGE) {
        creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
      }

      // 修完了
      if (target.hits == target.hitsMax) {
        creep.memory.task = null;
        creep.memory.targetId = null;
      }
    }
    else if (task === 'build') {

      const target = Game.getObjectById(creep.memory.targetId) as ConstructionSite;

      if (!target) {
        creep.memory.task = null;
        creep.memory.targetId = null;
        return
      }

      if (creep.store.getUsedCapacity() == 0) {
        creep.memory.task = 'harvest';
        creep.memory.targetId = null;
        return
      }

      if (creep.build(target) == ERR_NOT_IN_RANGE) {
        creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
      }
      // 建造完毕
      if (target.progress == target.progressTotal) {
        creep.memory.task = null;
        creep.memory.targetId = null;
      }

    }

  },
};
export default roleHarvester;
