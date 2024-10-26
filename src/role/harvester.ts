import { showDash } from './../var';
import { log } from "@/utils";
import { SpawnQueue } from "@/modules/autoCreate";
import { ROLE_NAME_ENUM } from "@/var";
import { assignRenewTask, shouldRenew } from '@/behavior/renew';
import { TaskType } from '@/modules/Task';
import taskRunner from '@/task/run';


const assignTasks = function (creep: Creep) {
  const roomName = creep.room.name;



  const containerId = creep.memory.containerId;
  const targetId = creep.memory.targetId;
  let target = null as Source | null;

  if (targetId) {
    target = Game.getObjectById(targetId);
  }


  const watiSomeTime = (ticks: number) => {
    log.info('behavior/harvester/watiSomeTime', '无任务');
    creep.memory.task = TaskType.wait; // 设置任务为等待
    creep.memory.waitTime = Game.time + ticks; // 设置等待时间
  }


  if (shouldRenew(creep)) {
    assignRenewTask(creep);
    return
  }

  // 刚出生 没有容器，有空闲的source 
  if (!containerId) {
    const freeSource = Memory.rooms[roomName].sourcesList.find(e => !e.creepId);
    if (freeSource) {
      creep.memory.targetId = freeSource.id;
      freeSource.creepId = creep.name;
      creep.memory.containerId = freeSource.containerId;
      creep.memory.task = TaskType.harvest;

    } else {
      log('behavior/harvester/assignTasks', creep.name, '没有空闲的source')
    }
  }


  // 有容器，没有采集任务 是刚刚renew完成
  if (containerId) {



    const sourceEmpty = target && target.energy === 0;
    const container = Game.getObjectById(creep.memory.containerId) as StructureContainer;
    const containerFull = container.store.getFreeCapacity() === 0;

    if (sourceEmpty) {
      watiSomeTime(target?.ticksToRegeneration || 10);
      log.info('behavior/harvester/assignTasks', creep.name, 'sourceEmpty')
      return
    }
    if (containerFull) {
      watiSomeTime(1);
      log.info('behavior/harvester/assignTasks', creep.name, 'containerFull')
      return
    }

    if (creep.memory.task !== TaskType.harvest) {

      //  房间的 sourceList 中 找到 当前creep 的容器
      const sourceListItem = Memory.rooms[roomName].sourcesList.find(e => e.containerId === creep.memory.containerId);
      // 判断 当前creep 是否是 这个source 的采集者
      const isSameSource = sourceListItem && sourceListItem.creepId === creep.name;

      if (sourceListItem && isSameSource) {
        // 设置采集目标
        creep.memory.targetId = sourceListItem.id;
        // 设置采集者
        sourceListItem.creepId = creep.name;
        // 设置任务
        creep.memory.task = TaskType.harvest;
        return
      }

      else {
        creep.memory.containerId = null;
        creep.memory.targetId = null;
        creep.memory.task = TaskType.wait;
        creep.memory.waitTime = Game.time + 1;
        log('behavior/harvester/assignTasks', creep.name, 'source 不是当前creep')
        return
      }
    }


    // 采集完成 空了，则等待
    else if (sourceEmpty || containerFull) {
      creep.memory.task = TaskType.wait;
      creep.memory.waitTime = Game.time + target.ticksToRegeneration;
      log('behavior/harvester/shouldWait', creep.name, "采集完成 空了，则等待")
    }

  }



  else {
    creep.memory.task = TaskType.wait;
    creep.memory.waitTime = Game.time + 5;
    log('behavior/harvester/shouldWait', creep.name, "没有空闲的source了")
  }

}

export default {
  run(creep: Creep) {
    taskRunner(creep, assignTasks)
  }
}