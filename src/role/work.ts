// 特殊资源采集
import { ROLE_NAME_ENUM, showDash } from "../var.js";
import { creepExtension } from "../modules/mount.js";
import { toBuildList, toFixedList } from "@/modules/structure.js";
import { log } from "@/utils";
import { TaskType } from "@/modules/Task.js";
import { StructureType, findSpawns } from "@/modules/Scanner.js";
import harvest from "@/behavior/harvest.js";
import take from "@/behavior/take.js";
import carry from "@/behavior/carry.js";
import upgrade from "@/behavior/upgrade.js";
import repair from "@/behavior/repair.js";
import build from "@/behavior/build.js";
import renew from "@/behavior/renew.js";
import { CREEP_LIFE_TIME_MIN } from "@/behavior/renew.js";
import taskRunner from "@/task/run.js";



const assignTasks = (creep: Creep) => {

  findSpawns();

  const roomName = creep.room.name
  const emptySource = creep.store.getUsedCapacity() == 0;
  const hasSource = creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0;
  const roomMemory = Memory.rooms[roomName];

  const workIndex = Object.entries(Game.creeps).filter(entry => {
    const [name, creep] = entry;
    if (creep.memory.role === ROLE_NAME_ENUM.worker) {
      return true
    }
  }).findIndex(entry => entry[0] === creep.name);


  const sourceStructure = Memory.rooms[roomName].sourceStructure;

  const toConstructionSite = roomMemory.toConstructionSite;

  // 是否需要续命
  const shouldRenew = CREEP_LIFE_TIME_MIN > creep.ticksToLive;

  // 是否需要优先升级
  const shouldUpdate = creep.room.controller.ticksToDowngrade < 10000;


  const hasCarry = roomMemory.carrysLength > 0;

  // 已经被carry 分配到的建筑物
  const carryTargetSet = new Set([...Object.values(Game.creeps).filter(s => s.memory.task === TaskType.carry).map(s => s.memory.targetId)]);


  const emptySpawn = _.cloneDeep(roomMemory.emptyStructureList)
    .filter(id => {
      const structure = Game.getObjectById(id) as AnyStoreStructure;

      const excludeList = [STRUCTURE_STORAGE];

      // @ts-ignore
      const exclude = hasCarry ? excludeList.includes(structure.structureType) : false;

      const hasCarryTarget = carryTargetSet.has(id);

      return !hasCarryTarget && !exclude;

    });



  if (shouldRenew) {
    const nearestSpawn = creep.pos.findClosestByPath(FIND_MY_SPAWNS);
    if (nearestSpawn) {
      creep.memory.task = TaskType.renew;
      creep.memory.targetId = nearestSpawn.id;
    }
  }

  /** 从建筑物里面拿出资源 */
  else if (emptySource && sourceStructure.length > 0) {
    const sourceStructure = _.cloneDeep(Memory.rooms[roomName].sourceStructure);

    if (sourceStructure.length > 1) {
      sourceStructure.sort((a, b) => {
        const aSource = Game.getObjectById(a) as StructureContainer
        const bSource = Game.getObjectById(b) as StructureContainer

        // 根据剩余能量排序
        return bSource.store.getUsedCapacity(RESOURCE_ENERGY) - aSource.store.getUsedCapacity(RESOURCE_ENERGY);
        const adistance = aSource.pos.getRangeTo(creep.pos)
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

    const freeSpawn = emptySpawn.sort((a, b) => {
      const aSource = Game.getObjectById(a) as StructureExtension
      const bSource = Game.getObjectById(b) as StructureExtension
      const adistance = aSource.pos.getRangeTo(creep.pos)
      const bdistance = bSource.pos.getRangeTo(creep.pos)
      // 返回距离最近的
      return adistance - bdistance
    })

    creep.memory.task = TaskType.carry;
    creep.memory.targetId = freeSpawn[0];

  }

  // 至少保留一个去升级
  else if (hasSource && shouldUpdate && workIndex === 0) {
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



  // 冗余去升级 
  else {
    log(`creep ${creep.name} 冗余去升级`, 'hasSource', hasSource, toConstructionSite.length)
    creep.memory.task = TaskType.upgrade;
  }
  // 升级控制器判断
}

const workRun = function (creep: Creep) {
  taskRunner(creep, assignTasks)
};

export default {
  run: workRun
};
