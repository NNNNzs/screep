// import { errorMapper } from './modules/errorMapper'
import { ErrorMapper } from "./modules/errorMappere.ts";

import roleUpgrader from "./role/upgrader.ts";
import roleBuilder from "./role/builder.ts";
import roleCarry from "./role/carry";
import roleOnlyHarvester from "./role/harvester.ts";
import roleRepair from "./role/repair";
import autoCreate from "./modules/autoCreate.ts";
import soldier from "./role/soldier";
import roleWork from "./role/work.ts";
import tower from "./building/tower";
import market from "./modules/market.ts";
import mount from "./modules/mount";
import { stateScanner } from "./modules/stateScanner.ts";
import { init, containerListMount } from "./modules/init.ts";
import { roomScanner } from "./modules/Scanner.ts";
mount();
init();

export const loop = ErrorMapper.wrapLoop(() => {
  const t = Game.time;
  roomScanner();
  stateScanner();

  autoCreate.run();
  tower.run();

  if (t % 3 === 0) {
    market.run();
    containerListMount();
  }

  // return false;
  let i = 0;
  let work = 0;
  let carry = 0;

  for (const name in Game.creeps) {
    const creep = Game.creeps[name];
    // const ticksToLive = creep.memory.autoIndex
    // creep.say(`${ticksToLive}`)

    const role = creep.memory.role;
    if (role == "carry") {
      roleCarry.run(creep, carry);
      carry++;
    } else if (role == "harvester") {
      roleOnlyHarvester.run(creep, work);
      work++;
    } else if (role == "builder") {
      roleBuilder.run(creep);
    } else if (role == "repair") {
      roleRepair.run(creep);
    } else if (role === "work") {
      roleWork.run(creep, i);
      i++;
    } else if (role === "soldier") {
      soldier.run(creep);
    }
  }
});
