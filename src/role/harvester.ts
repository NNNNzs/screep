import { log } from "@/utils";
import { SpawnQueue } from "@/modules/autoCreate";
import { ROLE_NAME_ENUM } from "@/var";


// 只会采集的采集者
const showDash = { visualizePathStyle: { stroke: "#ffaa00" } };
export const onlyHarvester = {
  run(creep: Creep) {


    // 挖矿
    try {
      const roomName = creep.room.name;

      let freeSource;

      if (!creep.memory.targetId) {
        freeSource = Memory.rooms[roomName].sourcesList.find(e => !e.creepId);

        if (freeSource) {
          creep.memory.targetId = freeSource.id;
          creep.memory.containerId = freeSource.containerId;
          freeSource.creepId = creep.name;
        } else {
          log("没有空闲的source了")
          return;
        }
      }


      const sources = Game.getObjectById(creep.memory.targetId) as Source
      const container = Game.getObjectById(creep.memory.containerId) as StructureContainer;

      // 移动到这个点
      if (creep.pos.isEqualTo(container)) {
        if (container.store.getFreeCapacity() == 0) {
          creep.say("偷懒");
        } else {
          creep.say("harvest");
          creep.harvest(sources);
        }
      } else {
        creep.say("moving!");
        creep.moveTo(container.pos, showDash);
      }
    } catch (error) {
      console.log("error", error);
    }
  }
};
