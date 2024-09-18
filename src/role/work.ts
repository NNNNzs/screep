// 特殊资源采集
import { ROLE_NAME_ENUM, showDash } from "../var.js";
import { creepExtension } from "../modules/mount.js";
import { toBuildList, toFixedList } from "@/modules/structure.js";
import { log } from "@/utils";
import { TaskType } from "@/modules/Task.js";
import { StructureType, findSpawns } from "@/modules/Scanner.js";


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




  /** 从建筑物里面拿出资源 */
  if (emptySource && sourceStructure.length > 0) {
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

  // 冗余去升级 
  else {
    log(`creep ${creep.name} 冗余去升级`, 'hasSource', hasSource, toConstructionSite.length)
    creep.memory.task = TaskType.upgrade;
  }
  // 升级控制器判断
}


export const harvest = function (creep: Creep) {
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

/** 从target里面拿出资源 */
export const take = function (creep: Creep) {
  const target = Game.getObjectById(creep.memory.targetId) as AnyStoreStructure;

  const res = creep.withdraw(target, RESOURCE_ENERGY);

  if (res == ERR_NOT_IN_RANGE) {
    creep.moveTo(target);
  };

  const errStatus = [ERR_NOT_ENOUGH_RESOURCES, ERR_FULL] as ScreepsReturnCode[]

  if (errStatus.includes(res)) {
    return false
  }

}

export const carry = function (creep: Creep) {

  if (creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
    return false;
  }

  const target = Game.getObjectById(creep.memory.targetId) as StructureExtension | StructureSpawn | StructureTower;

  if (![STRUCTURE_SPAWN, STRUCTURE_TOWER, STRUCTURE_EXTENSION, STRUCTURE_STORAGE].includes(target.structureType)) {
    console.log('目标不是 spawn/tower/extension/storage', target.structureType);
    return false
  }

  if (target.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
    return false
  }

  const res = creep.transfer(target, RESOURCE_ENERGY);

  if (res === ERR_NOT_IN_RANGE) {
    // todo  这里不正确 虽然很远，但是还是要判断是不是满了
    creep.moveTo(target, showDash);
  };

  if (res === ERR_NOT_ENOUGH_RESOURCES) {
    return false
  }

  if (res === ERR_FULL) {
    return false
  }

  if (target && target.structureType === STRUCTURE_SPAWN) {
    let t = target as StructureSpawn
    if (t.store.energy === 300) {
      console.log('STRUCTURE_SPAWN 已满');
      return false
    }

  }
}

export const upgrade = function (creep: Creep) {
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

export const repair = function (creep: Creep) {
  const target = Game.getObjectById(creep.memory.targetId) as Structure;


  if (creep.store.getUsedCapacity() == 0) {
    return false
  }

  // 还没去就修满了 就不去了
  if (target.hits == target.hitsMax) {
    toFixedList();
    return false
  }

  const res = creep.repair(target);

  if (res === ERR_NOT_IN_RANGE) {
    creep.moveTo(target);
  }

  if (res == ERR_NOT_ENOUGH_RESOURCES) {
    return false
  }

  // 修完了
  if (target.hits == target.hitsMax) {
    toFixedList();
    return false
  }
}

export const build = function (creep: Creep) {
  const target = Game.getObjectById(creep.memory.targetId) as ConstructionSite;

  if (creep.store.getUsedCapacity() == 0) {
    return false
  }

  // 还没去就修满了 就不去了
  if (target.progress == target.progressTotal) {
    toBuildList();
    return false
  }

  const res = creep.build(target);

  if (res == ERR_NOT_IN_RANGE) {
    creep.moveTo(target);
  };

  // 建造完毕
  if (target.progress == target.progressTotal) {
    toBuildList();
    return false
  }

}

const workRun = function (creep: Creep) {

  const emptySource = creep.store.getUsedCapacity() == 0;

  if (!creep.memory.task) {
    assignTasks(creep);
  }

  const task = creep.memory.task;
  const target = Game.getObjectById(creep.memory.targetId) as Source;

  if (!target) {
    assignTasks(creep);
    workRun(creep);
    return
  }

  switch (task) {

    case TaskType.harvest: {
      const res = harvest(creep);
      if (res === false) {
        assignTasks(creep);
        workRun(creep);
      }
      break;
    }
    case TaskType.take: {
      const res = take(creep);
      if (res === false) {
        assignTasks(creep);
        workRun(creep);
      }
      break;
    }

    case TaskType.carry: {
      const res = carry(creep);
      if (res === false) {
        assignTasks(creep);
        workRun(creep);
      }
      break;
    }

    case TaskType.upgrade: {
      const res = upgrade(creep);
      if (res === false) {
        assignTasks(creep);
        workRun(creep);
      }
      break;
    }

    case TaskType.repair: {
      const res = repair(creep);
      if (res === false) {
        assignTasks(creep);
        workRun(creep);
      };
      break;
    }

    case TaskType.build: {
      const res = build(creep);
      if (res === false) {
        assignTasks(creep);
        workRun(creep);
      }
      break;
    }
  }
  creep.say(task);
};
export default {
  run: workRun
};
