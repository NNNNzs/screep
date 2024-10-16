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
  }
}

export const shouldRenew = (creep: Creep) => {
  // 1. 检查剩余寿命
  const ticksToLive = creep.ticksToLive < CREEP_LIFE_TIME_MIN;
  
  // 2. 检查身体部件是否达到最大要求
  const maxCountBodyPart = isMaxCountBodyPart(creep);
  
  // 3. 检查房间能量情况
  const room = creep.room;
  const energyAvailable = room.energyAvailable;
  const energyCapacityAvailable = room.energyCapacityAvailable;
  const energySufficient = energyAvailable > energyCapacityAvailable * 0.8;
  
  // 4. 计算Creep的重要性和替代成本
  // const creepCost = getCreepCost(creep.body);
  const isExpensive = false;
  
  // 5. 检查是否有空闲的 Spawn
  const availableSpawn = room.find(FIND_MY_SPAWNS, {
    filter: (spawn) => !spawn.spawning
  }).length > 0;

  // 6. 检查当前是否正在进行重要任务
  const isPerformingCriticalTask = creep.memory.criticalTask === true;

  // 记录日志
  log(
    creep.name,
    'renewCheck:',
    'ticksToLive:', ticksToLive,
    'maxCountBodyPart:', maxCountBodyPart,
    'energySufficient:', energySufficient,
    'isExpensive:', isExpensive,
    'availableSpawn:', availableSpawn,
    'isPerformingCriticalTask:', isPerformingCriticalTask
  );

  // 决定是否应该更新
  return ticksToLive &&
         maxCountBodyPart &&
         energySufficient &&
         isExpensive &&
         availableSpawn &&
         !isPerformingCriticalTask;
}

export default function (creep: Creep) {

  return;
  const nearestSpawn = Game.getObjectById(creep.memory.targetId) as StructureSpawn;

  const res = nearestSpawn.renewCreep(creep);

  if (res === ERR_NOT_IN_RANGE) {
    creep.moveTo(nearestSpawn, showDash);
  }
  else if (res === OK) {

  }
  else if (res === ERR_BUSY) {
    // console.log('renew busy ', creep.name, res);
  }
  else {
    console.log('renew error ', creep.name, res);
    return false;
  }


  creep.say(`renewing ${creep.name}-${res}`);

}
