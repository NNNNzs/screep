import { TaskType } from "@/modules/Task";
import { showDash } from "@/var";
export const CREEP_LIFE_TIME_MIN = CREEP_LIFE_TIME / 5;

export const assignRenewTask = (creep: Creep) => {
  const nearestSpawn = creep.pos.findClosestByPath(FIND_MY_SPAWNS);
  if (nearestSpawn) {
    creep.memory.task = TaskType.renew;
    creep.memory.targetId = nearestSpawn.id;
  }
}

export default function (creep: Creep) {
  const nearestSpawn = Game.getObjectById(creep.memory.targetId) as StructureSpawn;

  const res = nearestSpawn.renewCreep(creep);

  if (res === ERR_NOT_IN_RANGE) {
    creep.moveTo(nearestSpawn, showDash);
  } else {
    console.log('renew error ', res);
  }

  const existStatus = [ERR_FULL, ERR_NOT_ENOUGH_ENERGY];
  const isExis = existStatus.some(stats => res == stats);

  if (isExis) {
    return false;
  }

}