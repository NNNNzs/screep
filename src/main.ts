import { ErrorMapper } from "./modules/errorMappere";
import autoCreate from "./modules/autoCreate";
import { roomScanner } from "./modules/Scanner";
import mount from "./modules/mount.js";
// import { debugerForTest } from "./utils";

// 初始化游戏，挂载扩展方法
mount();

// 主循环函数，使用 ErrorMapper 包装以获得更好的错误追踪
export const loop = ErrorMapper.wrapLoop(() => {
  // 扫描房间信息
  roomScanner();

  // 运行自动创建 creep 逻辑
  autoCreate.run();

  // 遍历所有 creep 并执行其行为
  for (const name in Game.creeps) {
    const creep = Game.creeps[name];
    creep.run();
  }

  // 处理旗帜相关逻辑
  for (const flag of Object.values(Game.flags)) {
    // 如果是探索者旗帜，则执行探索逻辑（当前被注释）
    if (flag.name.startsWith('explorer')) {
      // explorer.run(flag.pos);
    }
  }
});