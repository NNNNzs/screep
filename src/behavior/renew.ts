import { TaskType } from "@/modules/Task";
import { isMaxCountBodyPart } from "@/modules/autoCreate";
import { log } from "@/utils";
import { showDash } from "@/var";
export const CREEP_LIFE_TIME_MIN = CREEP_LIFE_TIME / 5;

export const assignRenewTask = (creep: Creep) => {
  const nearestSpawn = creep.pos.findClosestByPath(FIND_MY_SPAWNS);
  if (nearestSpawn) {
    creep.memory.task = TaskType.renew;
    creep.memory.targetId = nearestSpawn.id;
  }
}

export const shouldRenew = (creep: Creep) => {
  // todo 当前的身体组件是否已经满足了最大要求
  // creep.body

  const ticksToLive = CREEP_LIFE_TIME_MIN > creep.ticksToLive
  const maxCountBodyPart = isMaxCountBodyPart(creep);

  log(creep.name, 'maxCountBodyPart', maxCountBodyPart, 'ticksToLive', ticksToLive);

  return ticksToLive && maxCountBodyPart;

}

export default function (creep: Creep) {
  const nearestSpawn = Game.getObjectById(creep.memory.targetId) as StructureSpawn;

  const res = nearestSpawn.renewCreep(creep);

  if (res === ERR_NOT_IN_RANGE) {
    creep.moveTo(nearestSpawn, showDash);
  }
  else if (res === OK) {

  }
  else if (res === ERR_BUSY) {
    console.log('renew busy ', creep.name, res);
  }
  else {
    console.log('renew error ', creep.name, res);
    return false;
  }


  creep.say(`renewing ${creep.name}-${res}`);

}