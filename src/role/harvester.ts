import { showDash } from './../var';
import { log } from "@/utils";
import { SpawnQueue } from "@/modules/autoCreate";
import { ROLE_NAME_ENUM } from "@/var";
import { assignRenewTask, shouldRenew } from '@/behavior/renew';
import { TaskType } from '@/modules/Task';
import taskRunner from '@/task/run';


const assignTasks = function (creep: Creep) {
  const roomName = creep.room.name;

  const freeSource = Memory.rooms[roomName].sourcesList.find(e => !e.creepId);

  const containerId = creep.memory.containerId;
  const targetId = creep.memory.targetId;
  let target = null as Source | null;

  if (targetId) {
    target = Game.getObjectById(targetId);
  }


  const watiSomeTime = () => {
    console.log('无任务'); // 输出无任务
    creep.memory.task = TaskType.wait; // 设置任务为等待
    creep.memory.waitTime = Game.time + 10; // 设置等待时间
  }



  if (shouldRenew(creep)) {
    assignRenewTask(creep);
    return
  }

  // 刚出生 没有容器，有空闲的source 
  else if (!containerId && freeSource) {
    creep.memory.targetId = freeSource.id;
    freeSource.creepId = creep.name;
    creep.memory.containerId = freeSource.containerId;
    creep.memory.task = TaskType.harvest;

  }

  // 有容器，没有采集任务 是刚刚renew完成
  else if (containerId && creep.memory.task !== TaskType.harvest) {
    const source = Memory.rooms[roomName].sourcesList.find(e => e.containerId === creep.memory.containerId);

    if (source) {
      creep.memory.targetId = source.id;
      source.creepId = creep.name;
      creep.memory.task = TaskType.harvest;
    }

  }
  // 采集完成 空了，则等待
  else if (targetId && target.energy === 0) {
    creep.memory.task = TaskType.wait;
    creep.memory.waitTime = Game.time + target.ticksToRegeneration;
    log(creep.name, "采集完成 空了，则等待")
  }

  else {
    creep.memory.task = TaskType.wait;
    creep.memory.waitTime = Game.time + 5;
    log(creep.name, "没有空闲的source了")
  }

}

export default {
  run(creep: Creep) {
    taskRunner(creep, assignTasks)
  }
}