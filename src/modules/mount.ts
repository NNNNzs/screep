const showDash = { visualizePathStyle: { stroke: "#ffaa00" } };
import { runAfterStart } from "@/utils.js";
import { createBody, deleteCreepMemory } from "./autoCreate";
import { findEmptySourceStructure, findSourceStructure, } from './Scanner'
import { ROLE_NAME_ENUM } from "@/var";


runAfterStart(() => {

  global.clearMemory = () => {
    Object.keys(Memory).forEach((key) => {
      delete Memory[key];
    });
    console.log("clearMemory");
  }

  global.deleteCreepMemory = deleteCreepMemory;

  global.killAllScreep = () => {
    Object.keys(Game.creeps).forEach((name) => {
      const creep = Game.creeps[name];
      creep.suicide();
    });
  };

  global.clearMemeory = () => {
    Object.keys(Memory).forEach((name) => {
      delete Memory[name];
    });
  };

}, 10)


export const creepExtension = {


  /** 改良 从房间队列获取 将资源送到建筑物 */
  sendRourceToStructure(
    reverse = false
  ) {
    const roomName = this.room.name;
    // let sources = findEmptySourceStructure(this, rank) || [];
    let sources = Memory.rooms[roomName].emptyStructureList

    if (sources.length == 0) {
      return true;
    }
    // 倒着来
    if (reverse) {
      sources.reverse();
    }
    const target = Game.getObjectById(sources[0])

    if (this.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      this.moveTo(target, showDash);
      return false;
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
};

/** 
 * @description 挂载所有的额外属性和方法 初始化代码加载信息
 */
export default function () {
  // 日期设置为八小时之后
  Memory.lastModified = new Date(new Date().getTime() + 8 * 60 * 60 * 1000).toLocaleString();
  Memory.startTick = Game.time;
  console.log('reload at ' + Memory.lastModified);

  _.assign(Creep.prototype, creepExtension);
}
