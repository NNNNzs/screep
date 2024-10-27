const sleepTime = 2;
export default function (creep: Creep) {
  if (creep.memory.waitTime) {
    if (Game.time > creep.memory.waitTime) {
      return false;
    }
  } else {
    creep.memory.waitTime = Game.time + sleepTime;
  }
}