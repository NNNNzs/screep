
import { ErrorMapper } from "./modules/errorMappere";
import autoCreate from "./modules/autoCreate";
import { roomScanner } from "./modules/Scanner";
import mount from "./modules/mount.js";
// init();

mount();

export const loop = ErrorMapper.wrapLoop(() => {

  roomScanner();

  autoCreate.run();


  for (const name in Game.creeps) {
    const creep = Game.creeps[name];
    creep.run(); 
  }

});