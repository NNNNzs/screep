
import { ErrorMapper } from "./modules/errorMappere";
import autoCreate from "./modules/autoCreate";
import { roomScanner } from "./modules/Scanner";
import mount from "./modules/mount.js";
// import { debugerForTest } from "./utils";

mount();

export const loop = ErrorMapper.wrapLoop(() => {

  // console.log('loop', Game.time);
  roomScanner();

  autoCreate.run();


  for (const name in Game.creeps) {
    const creep = Game.creeps[name];
    creep.run();
  }

  for (const flag of Object.values(Game.flags)) {

    if (flag.name.startsWith('explorer')) {
      // explorer.run(flag.pos);
    }
  }

});