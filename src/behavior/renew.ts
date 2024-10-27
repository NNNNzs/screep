import { TaskType } from "@/modules/Task";
import { isMaxCountBodyPart } from "@/modules/autoCreate";
import { log } from "@/utils";
import { showDash } from "@/var";
import { getCreepCost } from "@/utils/creep";

export const CREEP_LIFE_TIME_MIN = CREEP_LIFE_TIME / 5;

export const assignRenewTask = (creep: Creep) => {
  const nearestSpawn = creep.pos.findClosestByPath(FIND_MY_SPAWNS);
  if (nearestSpawn) {
    creep.memory.task = TaskType.renew;
    creep.memory.targetId = nearestSpawn.id;
    creep.memory.targetType = STRUCTURE_SPAWN;
  }
}

export const shouldRenew = (creep: Creep) => {
  // 1. 检查剩余寿命
  const ticksToLive = creep.ticksToLive < CREEP_LIFE_TIME_MIN;

  // 2. 检查身体部件是否达到最大要求
  const maxCountBodyPart = isMaxCountBodyPart(creep);

  // log('behavior/renew', 'maxCountBodyPart', maxCountBodyPart)

  // 3. 检查房间能量情况
  const room = creep.room;
  const energyAvailable = room.energyAvailable;
  const energyCapacityAvailable = isNaN(room.energyCapacityAvailable) ? room.energyAvailable : room.energyCapacityAvailable;
  const energySufficient = energyAvailable > energyCapacityAvailable * 0.5;
  // log.warn('behavior/renew', 'energyAvailable', energyAvailable, 'energyCapacityAvailable', energyCapacityAvailable, 'energySufficient', energySufficient)




  const flag = ticksToLive &&
    maxCountBodyPart &&
    energySufficient
  if (flag) {
    log.info('behavior/renew', 'shouldRenew', creep.name, ticksToLive);
  }
  return flag
}

export default function (creep: Creep) {

  // return;
  const nearestSpawn = Game.getObjectById(creep.memory.targetId) as StructureSpawn;

  const res = nearestSpawn.renewCreep(creep);

  if (res === ERR_NOT_IN_RANGE) {
    creep.moveTo(nearestSpawn, showDash);
  }
  else if (res === OK) {

  }
  else if (res === ERR_BUSY) {
    log('behavior/renew', 'renew busy ', creep.name, res);
    // return false
  }
  else {
    log('behavior/renew', 'renew error ', creep.name, res);
    return false;
  }


  creep.say(`renewing ${creep.name}-${res}`);

}
