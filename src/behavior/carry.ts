import { showDash } from "@/var";


export default function (creep: Creep) {

  if (creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
    return false;
  }

  const target = Game.getObjectById(creep.memory.targetId) as StructureExtension | StructureSpawn | StructureTower;

  if (![STRUCTURE_SPAWN, STRUCTURE_TOWER, STRUCTURE_EXTENSION, STRUCTURE_STORAGE].includes(target.structureType)) {
    console.log('目标不是 spawn/tower/extension/storage', target.structureType);
    return false
  }

  if (target.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
    return false
  }

  const res = creep.transfer(target, RESOURCE_ENERGY);

  if (res === ERR_NOT_IN_RANGE) {
    // todo  这里不正确 虽然很远，但是还是要判断是不是满了
    creep.moveTo(target, showDash);
  };

  if (res === ERR_NOT_ENOUGH_RESOURCES) {
    return false
  }

  if (res === ERR_FULL) {
    return false
  }

  if (target && target.structureType === STRUCTURE_SPAWN) {
    let t = target as StructureSpawn
    if (t.store.energy === 300) {
      console.log('STRUCTURE_SPAWN 已满');
      return false
    }

  }
}
