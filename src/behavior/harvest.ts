import { log } from "@/utils.js";
import { showDash } from "../var.js";

export default function (creep: Creep) {
  const target = Game.getObjectById(creep.memory.targetId) as Source;


  // 如果有固定点位的container 
  if (creep.memory.containerId) {
    const container = Game.getObjectById(creep.memory.containerId) as StructureContainer;

    if (!creep.pos.isEqualTo(container)) {
      creep.moveTo(container.pos, showDash);
      return true;
    }

    else {
      // 满了
      if (container.store.getFreeCapacity() == 0) {
        log('behavior/harvest', 'container', container.id, '满了')
        return false
      } else if (target.energy === 0) {
        log('behavior/harvest', 'source', target.id, '没有能量了')
        return false
      }
      else {
        const res = creep.harvest(target);
      }
    }
  }

  else {
    const res = creep.harvest(target);

    if (res === ERR_NOT_IN_RANGE) {
      creep.moveTo(target, showDash);
    }

    if (res === ERR_INVALID_TARGET) {
      log('behavior/harvest', 'source', target.id, '无效目标')
      return false;
    }

    if (creep.store.getFreeCapacity() == 0) {
      log('behavior/harvest', 'creep', creep.name, '采集者满了')
      return false
    };

    // 判断如果是采集完了，就切换任务
    if (target.energy == 0) {
      log('behavior/harvest', 'source', target.id, '没有能量了')
      return false;
    }
  }

};