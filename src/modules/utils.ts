
type StructureType = STRUCTURE_SPAWN | STRUCTURE_EXTENSION | STRUCTURE_CONTAINER | STRUCTURE_STORAGE
// 找到空的建筑，一般用于存放能量
// todo 能量升序
export const findEmptyStructure = (creep: Creep, rank: StructureType[]): AnyOwnedStructure[] => {

  let sources: AnyOwnedStructure[]

  const hasEmptySource = rank.some((structureType) => {
    const notFullStructures = creep.room.find(FIND_MY_STRUCTURES, {
      filter: (s) => {
        return (s.structureType === structureType && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
      }
    });
    if (notFullStructures.length > 0) {
      sources = notFullStructures
      return true
    } else {
      return false
    }
  });

  return sources

}

// 寻找可以取出来能量的建筑
// todo 能量降序
export const findResourceStructure = (creep, rank) => {
  for (let i in rank) {
    const structure = rank[i]
    let sources = creep.room.find(FIND_STRUCTURES, {
      filter: (s) => { return (s.structureType == structure && s.store.getUsedCapacity(RESOURCE_ENERGY) > 0) }
    });
    if (sources.length > 0) {
      sources.sort((a, b) => b.store.getUsedCapacity() - a.store.getUsedCapacity())
      return sources;
    } else {
      continue;
    }
  }
}
export const calcRange = (p1, p2) => {
  // return Math
}
export const findResourceTombstons = (creep) => {
  // const sources = creep.room.find(FIND_TOMBSTONES)
  // const sources = creep.room.find(FIND_STRUCTURES);
  creep.room.find(FIND_TOMBSTONES).forEach(tombstone => {
    if (tombstone.creep.my) {
      console.log(`My creep died with ID=${tombstone.creep.id} ` +
        `and role=${Memory.creeps[tombstone.creep.name].role}`);
    }
  });
  // console.log(sources)
}
