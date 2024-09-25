import { showDash } from "@/var";

/** 从creep的store中 转移资源 */
export default function (creep: Creep) {

  if (creep.store.getUsedCapacity() == 0) {
    console.log('没有能量了');
    return false;
  }

  const target = Game.getObjectById(creep.memory.targetId) as StructureExtension | StructureSpawn | StructureTower;

  if (![STRUCTURE_SPAWN, STRUCTURE_TOWER, STRUCTURE_EXTENSION, STRUCTURE_STORAGE].includes(target.structureType)) {
    console.log('目标不是 spawn/tower/extension/storage', target.structureType);
    return false
  }

  if (target.store.getFreeCapacity() == 0) {
    console.log('目标已经满了');
    return false
  }

  // 转移所有能量 有一个成功则为成功
  const success = Object.keys(creep.store).some(sourceType => {

    const res = creep.transfer(target, sourceType as ResourceConstant);


    if (res === ERR_NOT_IN_RANGE) {
      // todo  这里不正确 虽然很远，但是还是要判断是不是满了
      creep.moveTo(target, showDash);
      return true;
    };
    if (res === OK) {
      return true;
    } else {
      console.log('transfer res ', res, 'sourceType', sourceType);
      return false
    }
  });


  if (!success) {
    return false
  }



}
