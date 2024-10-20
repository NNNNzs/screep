import { TaskType } from "@/modules/Task";

import take from "@/behavior/take";
import carry from "@/behavior/carry";
import harvest from "@/behavior/harvest";
import renew from "@/behavior/renew";
import upgrade from "@/behavior/upgrade";
import build from "@/behavior/build";
import repair from "@/behavior/repair";
import { log } from "@/utils";
import { ROLE_NAME_ENUM } from "@/var";
import wait from "@/behavior/wait";



const taskRunner = function (creep: Creep, assignTasks: (creep: Creep) => void) {


  if (creep.memory.role === ROLE_NAME_ENUM.worker) {
    // log(creep.name, creep.memory.task);
  }

  if (!creep.memory.task) {
    assignTasks(creep);
    return;
  }

  if (!creep.memory.targetId || !Game.getObjectById(creep.memory.targetId)) {
    assignTasks(creep);
    // taskRunner(creep, assignTasks);
    return;
  }


  const task = creep.memory.task;

  creep.say(task);

  switch (task) {

    case TaskType.harvest: {
      const res = harvest(creep);
      if (res === false) {
        log("harvest error")
        assignTasks(creep);
        taskRunner(creep, assignTasks);
      }
      break;
    }

    case TaskType.take: {
      const res = take(creep);
      if (res === false) {
        log("take error")
        assignTasks(creep);
        taskRunner(creep, assignTasks);
      }
      break;
    }

    case TaskType.carry: {
      const res = carry(creep);
      if (res === false) {
        log("carry error")
        assignTasks(creep);
        taskRunner(creep, assignTasks);
      }
      break;
    }

    case TaskType.upgrade: {
      const res = upgrade(creep);
      if (res === false) {
        log("upgrade error")
        assignTasks(creep);
        taskRunner(creep, assignTasks);
      }
      break;
    }

    case TaskType.repair: {
      const res = repair(creep);
      if (res === false) {
        log("repair error")
        assignTasks(creep);
        taskRunner(creep, assignTasks);
      };
      break;
    }

    case TaskType.build: {
      const res = build(creep);
      if (res === false) {
        log("build error")
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

    case TaskType.wait: {
      const res = wait(creep);
      if (res === false) {
        log("wait error")
        assignTasks(creep);
        taskRunner(creep, assignTasks);
      }
      break
    }


  }

}


export default taskRunner