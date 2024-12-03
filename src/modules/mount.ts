import { log } from "@/utils.js";
import "@/modules/global";
import { ROLE_NAME_ENUM } from "@/var";

import roleHarvester from "@/role/harvester";
import roleWork from "@/role/work";
import CarryRole from "@/role/carry";
import ExplorerRole from "@/role/explorer";

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
      [ROLE_NAME_ENUM.carry]: CarryRole.run,
      [ROLE_NAME_ENUM.explorer]: ExplorerRole.run,
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
