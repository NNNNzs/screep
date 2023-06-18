const showDash = { visualizePathStyle: { stroke: "#ffaa00" } };
import { findResourceStructure, findEmptyStructure } from "./utils";

import { getCost } from "./autoCreate.ts";

export const creepExtension = {
  //计算消耗
  getCost: getCost,
  // 从建筑物里面拿出资源
  getResourceByStructure(
    rank = [
      STRUCTURE_STORAGE,
      STRUCTURE_CONTAINER,
      STRUCTURE_TERMINAL,
      STRUCTURE_EXTENSION,
      STRUCTURE_SPAWN,
    ]
  ) {
    const sources = findResourceStructure(this, rank);
    this.self_withdraw(sources[0]);
  },
  // 找到最近的建筑物
  findClosestBatch(
    rank = [
      STRUCTURE_SPAWN,
      STRUCTURE_EXTENSION,
      STRUCTURE_CONTAINER,
      STRUCTURE_STORAGE,
    ]
  ) {
    let res = false;
    let flag = rank.some((structureType) => {
      const targets = this.room.find(FIND_STRUCTURES, {
        filter: (s) =>
          s.structureType === structureType && s.store.getFreeCapacity() > 0,
      });
      if (targets.length > 0) {
        res = this.pos.findClosestByPath(targets);
        return true;
      }
    });
    return res;
  },
  /** 把资源送到存储仓库 */
  sendSourceToSroage() {
    if (!Memory.storage) {
      const structureSotrage = this.room.find(FIND_STRUCTURES, {
        filter: (s) => s.structureType === STRUCTURE_STORAGE,
      });
      Memory.storage = structureSotrage[0].id;
    }
    const id = Memory.storage;
    const target = Game.getObjectById(id);
    for (const resourceType in this.carry) {
      if (this.transfer(target, resourceType) == ERR_NOT_IN_RANGE) {
        this.moveTo(target);
      }
    }
  },
  sendSourceToLink() {},

  // 将资源送到建筑物
  sendRourceToStructure(
    rank = [
      STRUCTURE_SPAWN,
      STRUCTURE_EXTENSION,
      STRUCTURE_CONTAINER,
      STRUCTURE_STORAGE,
    ],
    reverse = false
  ) {
    let sources = findEmptyStructure(this, rank) || [];

    if (sources.length == 0) {
      return true;
    }
    // 倒着来
    if (reverse) {
      sources.reverse();
    }

    if (this.transfer(sources[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      this.moveTo(sources[0], showDash);
      return false;
    }
  },
  // 挖矿
  self_harvest(index = 1) {
    const sources = this.room.find(FIND_SOURCES);
    if (this.harvest(sources[index]) == ERR_NOT_IN_RANGE) {
      this.moveTo(sources[index], showDash);
    }
  },
  // 转移资源
  self_withdraw(sources) {
    if (this.withdraw(sources, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      this.moveTo(sources, showDash);
    }
  },
  // 当前房间是否全都空的
  isStructureEmpty(structures = []) {
    return structures.every((s) => s.store.getUsedCapacity() == 0);
  },
  // 建筑是否满了
  isStructureFull(structures = []) {
    // return structures.every(s => s.store.getFreeCapacity() == 0)
    return false;
  },
  // 修复建筑
  fixing() {
    // 如果身上还有能量，一次性用完
    if (this.store.getUsedCapacity() > 0 && this.memory.objId) {
      const toFixObj = Game.getObjectById(this.memory.objId);
      this.repair(toFixObj);
      this.say("biubiubiu");
      if (toFixObj.hits === toFixObj.hitsMax) {
        this.memory.objId = null;
      }
      return false;
    }
    const targets = global.toFixedStructures;

    // 根据当前剩余能量升序
    // 更改为根据能量剩余的比例，原因是有些建筑一次性掉血过多
    // targets.sort((a, b) => a.hits - b.hits);
    targets.sort((a, b) => a.hits / a.hitsMax - b.hits / b.hits);

    if (targets.length > 0) {
      if (this.repair(targets[0]) == ERR_NOT_IN_RANGE) {
        this.moveTo(targets[0], { visualizePathStyle: { fill: "#000000" } });
      }
      if (this.pos.inRangeTo(targets[0], 3)) {
        this.memory.objId = targets[0].id;
        this.say("biubiubiu");
      }
    } else {
      this.say("偷懒中");
      this.fixWall();
    }
  },
  fixWall() {
    const targets = this.room.find(FIND_STRUCTURES, {
      // 不修墙
      filter: (object) =>
        object.hits < 10000 && object.structureType === STRUCTURE_RAMPART,
    });
    if (targets.length > 0) {
      targets.sort((a, b) => a.hits / a.hitsMax - b.hits / b.hits);

      if (this.repair(targets[0]) == ERR_NOT_IN_RANGE) {
        this.say("修墙");
        this.moveTo(targets[0], { visualizePathStyle: { fill: "#000000" } });
      }
    } else {
      this.moveTo(new RoomPosition(42, 25, "W24S33"));
    }
  },
};

// 挂载所有的额外属性和方法
export default function () {
  const startCpu = Game.cpu.getUsed();
  const t = new Date();
  const date = new Date(t.setHours(t.getHours() + 8));
  
  console.log("mounted");
  console.log(date.toLocaleString());
  Memory.lastModified = date.toLocaleString();
  _.assign(Creep.prototype, creepExtension);

  const elapsed = Game.cpu.getUsed() - startCpu;
  console.log("mounted " + elapsed + " CPU time");
  // mountFlag()
  // mountRoom()
  // 其他更多拓展...
}
