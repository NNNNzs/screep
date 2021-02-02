// const { findResourceStructure, findEmptyStructure } = require('tools')
const pointes = [
  { source: '5bbcab9b9099fc012e633f27', container: '6016384c77f12f38ec1b14a5' },
  { source: '5bbcabec9099fc012e634838', container: '601658b66776c85cf0df8f2b' },
  // { source: '5bbcabec9099fc012e634838', container: '600c45f146267590a0dc3aeb' },
]
// 600c45f146267590a0dc3aeb
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
    // 从坑位里面拿货
    if (freeCapacity > 0 && !creep.memory.carring) {

      // 目标
      let sources = Game.getObjectById(pointes[index % Length].container)
      // 当自己的坑位空了的时候，去别人的坑位
      if (sources.store.getUsedCapacity() == 0) {
        index++
        sources = Game.getObjectById(pointes[index % Length].container)
      }
      // FIND_TOMBSTONES
      // 所有container空了
      const isContainersEmtyp = creep.isStructureEmpty(pointes.map(e => Game.getObjectById(e.container)));
      // 还有
      const isSpawnEmpty = creep.room.find(FIND_STRUCTURES, {
        filter: (s) => {
          return (
            [STRUCTURE_EXTENSION, STRUCTURE_SPAWN].includes(s.structureType) &&
            s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
          )
        }
      });
      // 有资源的墓碑
      const tombstones = creep.room.find(FIND_TOMBSTONES, {
        filter: (s) => s.store.getUsedCapacity() > 0
      });

      // 如果container空了，但是spaw和extension空着的，从storage里面拿
      if (isContainersEmtyp && isSpawnEmpty.length > 0) {
        creep.say('空啦')
        // sources = Game.getObjectById(tt)
      }

      // 从墓碑获取
      if (tombstones.length > 0) {
        sources = tombstones[0]
        for (const resourceType in sources.store) {
          if (creep.withdraw(sources, resourceType) == ERR_NOT_IN_RANGE) {
            creep.moveTo(sources);
          }
        }
      }
      else{
        for (const resourceType in sources.store) {
          if (creep.withdraw(sources, resourceType) == ERR_NOT_IN_RANGE) {
            creep.moveTo(sources);
          }
        }
      }
      // else if (creep.withdraw(sources, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      //   creep.moveTo(sources);
      // }
    } else {
      // 给建筑充能,存放资源
      const isFull = creep.sendRourceToStructure([STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_TOWER])
      const hasOtherSource = Object.keys(creep.carry).some(e => e != RESOURCE_ENERGY)

      if (hasOtherSource) {
        const target = Game.getObjectById(tt)
        for (const resourceType in creep.carry) {
          if (creep.transfer(target, resourceType) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
          }
        }
      }
      else if (isFull) {
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