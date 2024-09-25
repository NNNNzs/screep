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

  if (shouldRenew(creep)) {
    assignRenewTask(creep);
    return
  } else if (freeSource) {
    creep.memory.targetId = freeSource.id;
    freeSource.creepId = creep.name;
    creep.memory.containerId = freeSource.containerId;
    creep.memory.task = TaskType.harvest;
  } else {
    creep.memory.task = TaskType.wait;
    creep.memory.waitTime = Game.time + 100;
    log("没有空闲的source了")
  }

}

export default {
  run(creep: Creep) {
    taskRunner(creep, assignTasks)
  }
}