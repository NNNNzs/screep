import { deleteCreepMemory } from "./autoCreate";
import { log } from "@/utils";

/**
 * 全局函数声明
 */
declare global {
  namespace NodeJS {
    interface Global {
      clearMemory: () => string;
      clearTask: (creepName: string) => void;
      deleteCreepMemory: typeof deleteCreepMemory;
      killAllCreeps: () => void;
      clearTasks: () => void;
      showPos: (id: Id<AnyStructure>) => void;
    }
  }
}

/**
 * 清除所有内存数据
 * @returns {string} 执行成功的确认信息
 */
global.clearMemory = () => {
  Object.keys(Memory).forEach((key) => {
    delete Memory[key];
  });
  return 'Memory cleared successfully';
};

/**
 * 清除指定 creep 的任务
 * @param {string} creepName - 要清除任务的 creep 名称
 */
global.clearTask = (creepName: string) => {
  const creep = Game.creeps[creepName];
  if (!creep) {
    log.warn('global/clearTask', `Creep ${creepName} not found`);
    return;
  }
  creep.memory.task = null;
  creep.memory.targetId = null;
};

// 导出 creep 内存清理函数
global.deleteCreepMemory = deleteCreepMemory;

/**
 * 自杀所有 creep
 */
global.killAllCreeps = () => {
  Object.values(Game.creeps).forEach(creep => creep.suicide());
};

/**
 * 清除所有任务列表
 */
global.clearTasks = () => {
  Memory.taskList = [];
};

/**
 * 显示指定 ID 对象的位置
 * @param {Id<AnyStructure>} id - 要显示位置的建筑 ID
 */
global.showPos = (id: Id<AnyStructure>) => {
  const obj = Game.getObjectById(id);
  if (!obj) {
    log.warn('global/showPos', 'Object not found', id);
    return;
  }

  log.info('global/showPos', `Room: ${obj.room.name}`, `Pos: ${obj.pos}`);
  obj.room.visual.circle(obj.pos, {
    stroke: "#ffaa00",
    radius: 10,
    fill: "transparent",
    lineStyle: "dashed"
  });
};
