module.exports = {
  // 找到空的建筑，一般用于存放能量
  // todo 能量升序
  findEmptyStructure(creep, rank) {
    for (let i in rank) {
      const structure = rank[i]
      let sources = creep.room.find(FIND_STRUCTURES, {
        filter: (s) => { return (s.structureType == structure && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0) }
      });
      if (sources.length > 0) {
        sources.sort((a,b)=>a.store.getFreeCapacity() - b.store.getFreeCapacity())
        // let list = sources.map(e=>{
        //   return e.store.getFreeCapacity()
        // });
        // console.log(JSON.stringify(list))
        return sources;
      } else {
        continue;
      }
    }
  },
  // 寻找可以取出来能量的建筑
  // todo 能量降序
  findResourceStructure(creep, rank) {
    for (let i in rank) {
      const structure = rank[i]
      let sources = creep.room.find(FIND_STRUCTURES, {
        filter: (s) => { return (s.structureType == structure && s.store.getUsedCapacity(RESOURCE_ENERGY) > 0) }
      });
      if (sources.length > 0) {
        sources.sort((a,b)=>b.store.getUsedCapacity() - a.store.getUsedCapacity() )
        return sources;
      } else {
        continue;
      }
    }
  },
  // 找到最近的建筑矿物
  findSourceNear(){
    
  },
  
  findResourceTombstons(creep) {
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

}