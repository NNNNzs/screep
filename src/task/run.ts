import { TaskType } from "@/modules/Task";

import take from "@/behavior/take";
import carry from "@/behavior/carry";
import harvest from "@/behavior/harvest";
import renew from "@/behavior/renew";
import upgrade from "@/behavior/upgrade";
import build from "@/behavior/build";
import repair from "@/behavior/repair";


const taskRunner = function (creep: Creep, assignTasks: (creep: Creep) => void) {

  if (!creep.memory.task) {
    assignTasks(creep);
    return;
  }

  const task = creep.memory.task;
  const target = Game.getObjectById(creep.memory.targetId) as Source;

  switch (task) {

    case TaskType.harvest: {
      const res = harvest(creep);
      if (res === false) {
        assignTasks(creep);
        taskRunner(creep, assignTasks);
      }
      break;
    }
    case TaskType.take: {
      const res = take(creep);
      if (res === false) {
        assignTasks(creep);
        taskRunner(creep, assignTasks);
      }
      break;
    }

    case TaskType.carry: {
      const res = carry(creep);
      if (res === false) {
        assignTasks(creep);
        taskRunner(creep, assignTasks);
      }
      break;
    }

    case TaskType.upgrade: {
      const res = upgrade(creep);
      if (res === false) {
        assignTasks(creep);
        taskRunner(creep, assignTasks);
      }
      break;
    }

    case TaskType.repair: {
      const res = repair(creep);
      if (res === false) {
        assignTasks(creep);
        taskRunner(creep, assignTasks);
      };
      break;
    }

    case TaskType.build: {
      const res = build(creep);
      if (res === false) {
        assignTasks(creep);
        taskRunner(creep, assignTasks);
      }
      break;
    }

    case TaskType.renew: {
      const res = renew(creep);
      if (res === false) {
        assignTasks(creep);
        taskRunner(creep, assignTasks);
      }
      break;
    }


  }

  creep.say(task);
}


export default taskRunner