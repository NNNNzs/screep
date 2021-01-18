// const { findResourceStructure, findEmptyStructure } = require('tools')
const pointes = [
  { source: '5bbcabec9099fc012e634837', container: '6004f9ce3f6e2c29a1dd9325' },
  { source: '5bbcabec9099fc012e634838', container: '6004ff8ff9b4b3c6f2c61684' },
]
const tt = '6003bf8942c7e2223662c971'
const roleCarry = {
  run: function (creep, index = 0) {
    const Length = pointes.length
    // 工人的可存储空间
    const freeCapacity = creep.store.getFreeCapacity()
    // 如果存储空间为0，则应该去送货
    if (freeCapacity == 0) {
      creep.memory.carring = true
    }
    if (freeCapacity > 0 && !creep.memory.carring) {
      // 目标
      let sources = Game.getObjectById(pointes[index%Length].container)
      // 当自己的坑位空了的时候，去别人的坑位
      if(sources.store.getUsedCapacity()==0){
        index++
        sources = Game.getObjectById(pointes[index%Length].container)
      }
      else if(sources.store.getUsedCapacity()==0){
        sources = Game.getObjectById('6003bf8942c7e2223662c971')
      }
      if (creep.withdraw(sources, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(sources);
      }
    } else {
      // 填充能量
      const isFull = creep.sendRourceToStructure([STRUCTURE_SPAWN, STRUCTURE_EXTENSION,STRUCTURE_TOWER])
      if (isFull) {
        const target = Game.getObjectById(tt)
        if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(target);
        }
      }
      // 如果可用能量空了，则去挖矿
      if (creep.store.getUsedCapacity() == 0) {
        creep.memory.carring = false
      }
    }

  },
};

module.exports = roleCarry;