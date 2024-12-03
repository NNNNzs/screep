// 可视化路径样式配置
const showDash = { visualizePathStyle: { stroke: "#ffaa00" } };
import { log, runAfterStart } from "@/utils.js";
import { deleteCreepMemory } from "./autoCreate";
import { findEmptySourceStructure, findSourceStructure, } from './Scanner'

import { ROLE_NAME_ENUM } from "@/var";
import roleHarvester from "@/role/harvester";
import roleWork from "@/role/work";
import roleCarry from '@/role/carry';
import roleExplorer from '@/role/explorer';

// 全局函数：清除所有内存数据
global.clearMemory = () => {
  Object.keys(Memory).forEach((key) => {
    delete Memory[key];
  });
  return 'clearMemory'
}

// 全局函数：清除指定 creep 的任务
global.clearTask = (creepName: string) => {
  Game.creeps[creepName].memory.task = null;
  Game.creeps[creepName].memory.targetId = null;
}

// 全局函数：删除 creep 内存
global.deleteCreepMemory = deleteCreepMemory;

// 全局函数：自杀所有 creep
global.killAllScreep = () => {
  Object.keys(Game.creeps).forEach((name) => {
    const creep = Game.creeps[name];
    creep.suicide();
  });
};

// 全局函数：清除所有任务列表
global.clearTasks = () => {
  Memory.taskList = [];
}

// 全局函数：清除所有内存（与 clearMemory 功能重复，建议合并）
global.clearMemeory = () => {
  Object.keys(Memory).forEach((name) => {
    delete Memory[name];
  });
};

// 全局函数：显示指定 ID 对象的位置
global.showPos = (id: AnyStructure['id']) => {
  const obj = Game.getObjectById(id);
  if (!obj) {
    log.warn('module/mount/showPos', 'no obj', id)
    return;
  }
  log.info('module/mount/showPos', obj.room.name, obj, obj.pos);
  obj.room.visual.circle(obj.pos, { stroke: "#ffaa00", radius: 10 });
}

// Creep 原型扩展
export const creepExtension = {
  // creep 运行主函数
  run() {
    const creep = this as Creep;

    // 如果 creep 正在孵化，则跳过
    if (creep.spawning) {
      return;
    }

    // 角色行为映射表
    const roleActions = {
      [ROLE_NAME_ENUM.harvester]: roleHarvester.run,
      [ROLE_NAME_ENUM.worker]: roleWork.run,
      [ROLE_NAME_ENUM.carry]: roleCarry.run,
      [ROLE_NAME_ENUM.explorer]: roleExplorer.run,
    };

    // 执行对应角色的行为
    const action = roleActions[creep.memory.role];
    if (action) {
      action(creep);
    }
  },
};

/** 
 * @description 挂载所有的额外属性和方法，初始化代码加载信息
 * @returns void
 */
export default function () {
  // 设置最后修改时间（UTC+8）
  Memory.lastModified = new Date(new Date().getTime() + 8 * 60 * 60 * 1000).toLocaleString();
  // 记录游戏开始时的 tick
  Memory.startTick = Game.time;
  log.warn('module/mount', 'reload at ' + Memory.lastModified);

  // 将扩展方法挂载到 Creep 原型上
  _.assign(Creep.prototype, creepExtension);
}
