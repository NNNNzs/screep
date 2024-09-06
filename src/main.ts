
import { ErrorMapper } from "./modules/errorMappere";

// import roleUpgrader from "./role/upgrader.ts";
// import roleBuilder from "./role/builder.ts";
// import roleCarry from "./role/carry";
import { onlyHarvester } from "./role/harvester";
// import roleRepair from "./role/repair";
import autoCreate from "./modules/autoCreate";
// import soldier from "./role/soldier";
import roleWork from "./role/work";
// import tower from "./building/tower";
// import market from "./modules/market.ts";
// import { init, containerListMount } from "./modules/init.ts";
// import { stateScanner } from "./modules/stateScanner.ts";
import { roomScanner } from "./modules/Scanner";
import mount from "./modules/mount.js";
import { ROLE_NAME_ENUM } from "./var";
// init();

mount();

export const loop = ErrorMapper.wrapLoop(() => {

  roomScanner();

  autoCreate.run();


  for (const name in Game.creeps) {
    const creep = Game.creeps[name];
    if (creep.memory.role === ROLE_NAME_ENUM.harvester) {
      onlyHarvester.run(creep);
    } else if (creep.memory.role === ROLE_NAME_ENUM.worker) {
      roleWork.run(creep);
    }
  }
});