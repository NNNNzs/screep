// 特殊资源采集
import { ROLE_NAME_ENUM, showDash } from "../var.js";
import { creepExtension } from "../modules/mount.js";
import { toBuildList, toFixedList } from "@/modules/structure.js";
import { log } from "@/utils";
import { TaskType } from "@/modules/Task.js";
import { findSpawns } from "@/modules/Scanner.js";
const roleHarvester = {
  run: function (creep: Creep) {

    const roomName = creep.room.name
    const emptySource = creep.store.getUsedCapacity() == 0;

    if (!creep.memory.task) {

      const hasSource = creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0;
      const roomMemory = Memory.rooms[roomName];

      const workIndex = Object.entries(Game.creeps).filter(entry => {
        const [name, creep] = entry;
        if (creep.memory.role === ROLE_NAME_ENUM.worker) {
          return true
        }
      }).findIndex(entry => entry[0] === creep.name);


      const emptySpawn = roomMemory.emptyStructureList;
      const sourceStructure = Memory.rooms[roomName].sourceStructure;
      const toConstructionSite = roomMemory.toConstructionSite


      /** 从建筑物里面拿出资源 */
      if (emptySource && sourceStructure.length > 0) {
        // creep.memory.targetId = Memory.rooms[roomName].sourceStructure[0];
        const sourceStructure = _.cloneDeep(Memory.rooms[roomName].sourceStructure);

        if (sourceStructure.length > 1) {
          sourceStructure.sort((a, b) => {
            const aSource = Game.getObjectById(a) as StructureContainer
            const bSource = Game.getObjectById(b) as StructureContainer

            // 根据剩余能量排序
            return bSource.store.getUsedCapacity(RESOURCE_ENERGY) - aSource.store.getUsedCapacity(RESOURCE_ENERGY);
            const adistance = aSource.pos.getRangeTo(bSource.pos)
            const bdistance = bSource.pos.getRangeTo(creep.pos)
            // 返回距离最近的
            return adistance - bdistance
          });
        }
        creep.memory.task = TaskType.take;
        creep.memory.targetId = sourceStructure[0];

      }

      // 挖矿判断
      else if (emptySource && creep.store.getUsedCapacity() == 0) {
        // 这里应该替换成没有harvester的资源矿
        const sources = creep.room.find(FIND_SOURCES, {
          filter: (s: Source) => s.energy > 0,
        });

        sources.sort((a, b) => {
          return b.energy - a.energy
        })

        if (sources.length !== 0) {
          creep.memory.task = TaskType.harvest;
          const creepIndex = workIndex % sources.length;
          creep.memory.targetId = sources[creepIndex].id;
        }
      }

      // 如果有空的spawn extension，优先送货
      else if (hasSource && emptySpawn.length > 0) {

        // 先过滤到没有被分配的
        const freeSpawn = emptySpawn.filter(e => {
          return Object.values(Game.creeps).filter(s => s.memory.task === TaskType.carry).map(s => s.memory.targetId !== e)
        });

        // 找个最近的
        freeSpawn.sort((a, b) => {
          const aSource = Game.getObjectById(a) as StructureExtension
          const bSource = Game.getObjectById(b) as StructureExtension
          const adistance = aSource.pos.getRangeTo(bSource.pos)
          const bdistance = bSource.pos.getRangeTo(creep.pos)
          // 返回距离最近的
          return adistance - bdistance
        })

        if (freeSpawn.length > 0) {
          creep.memory.task = TaskType.carry;
          creep.memory.targetId = freeSpawn[0]
        } else {
          log(`creep ${creep.name} 冗余去升级`, 'hasSource', hasSource, toConstructionSite.length)
          creep.memory.task = TaskType.upgrade;
        }

      }

      // 至少保留一个去升级
      else if (hasSource && workIndex === 0) {
        log(`creep ${creep.name} 优先升级`)
        creep.memory.task = TaskType.upgrade;
      }

      // 修理判断
      else if (hasSource && roomMemory.toFixedStructures.length > 0) {
        creep.memory.task = TaskType.repair;
        creep.memory.targetId = roomMemory.toFixedStructures[0].id;
      }


      // 建造判断
      else if (hasSource && toConstructionSite.length > 0) {
        creep.memory.task = TaskType.build;
        creep.memory.targetId = roomMemory.toConstructionSite[0].id;
      }

      //送货判断 
      else if (creep.store.getFreeCapacity() == 0) {
        creep.memory.task = TaskType.carry;
      }

      // 冗余去升级 
      else {
        log(`creep ${creep.name} 冗余去升级`, 'hasSource', hasSource, toConstructionSite.length)
        creep.memory.task = TaskType.upgrade;
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

    } else if (task === 'take') {
      const target = Game.getObjectById(creep.memory.targetId) as Structure;

      if (!target) {
        creep.memory.task = null;
        creep.memory.targetId = null;
        return
      }

      const res = creep.withdraw(target, RESOURCE_ENERGY);

      if (res == ERR_NOT_IN_RANGE) {
        creep.moveTo(target);
      };

      const errStatus = [ERR_NOT_ENOUGH_RESOURCES, ERR_FULL] as ScreepsReturnCode[]
      if (errStatus.includes(res)) {
        creep.memory.task = null;
        creep.memory.targetId = null;
      }

    }

    else if (task === 'carry') {
      if (creep.store.getUsedCapacity() == 0) {
        creep.memory.task = null;
        return;
      }

      const target = Game.getObjectById(creep.memory.targetId) as StructureExtension | StructureSpawn | StructureTower;
      const res = creep.transfer(target, RESOURCE_ENERGY);

      if (res === ERR_NOT_IN_RANGE) {
        // 虽然很远，但是还是要判断是不是满了
        if (target.store.getFreeCapacity() == 0) {
          creep.memory.task = null
        } else {
          creep.moveTo(target, showDash);
        }
      };

      if (res === ERR_NOT_ENOUGH_RESOURCES) {
        creep.memory.task = null;
        creep.memory.targetId = null;
      }

      if (res === ERR_FULL) {
        console.log('target store 已满');
        creep.memory.task = null;
        creep.memory.targetId = null;
        findSpawns();
      }


      if (target.structureType === STRUCTURE_SPAWN) {
        let t = target as StructureSpawn
        if (t.store.energy === 300) {
          console.log('STRUCTURE_SPAWN 已满');
          findSpawns();
          creep.memory.task = null;
          creep.memory.targetId = null;
        }

      }


    }
    else if (task === 'upgrade') {
      const controller = creep.room.controller;

      if (!controller) {
        creep.memory.task = null;
        // 该房间没有控制器
        return
      }
      const res = creep.upgradeController(controller);

      if (res === ERR_NOT_IN_RANGE) {
        creep.moveTo(controller, showDash);
      };

      if (emptySource) {
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
        creep.memory.task = null;
        creep.memory.targetId = null;
        return
      }
      const res = creep.repair(target);

      if (res === ERR_NOT_IN_RANGE) {
        creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
      }

      if (res == ERR_NOT_ENOUGH_RESOURCES) {
        creep.memory.task = null;
        creep.memory.targetId = null;
        return
      }

      // 修完了
      if (target.hits == target.hitsMax) {
        toFixedList();
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
        creep.memory.task = null;
        creep.memory.targetId = null;
        return
      }

      if (creep.build(target) == ERR_NOT_IN_RANGE) {
        creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
      };

      // 建造完毕
      if (target.progress == target.progressTotal) {
        creep.memory.task = null;
        creep.memory.targetId = null;
        toBuildList();
      }

    }

    creep.say(task);
  },
};
export default roleHarvester;
