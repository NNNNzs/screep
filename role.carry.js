const pointes = [
  { source: '5bbcab9b9099fc012e633f27', container: '60574a561d26a9519ae39b8c' },
  { source: '5bbcabec9099fc012e634838', container: '60574df3d0d3a84a56181797' },
  // { source: '5bbcabec9099fc012e634838', container: '600c45f146267590a0dc3aeb' },
]
// 600c45f146267590a0dc3aeb
const tt = '60199445a8628c34e4c3bc81'
const terminal = '60219ee55a1b60469b3c8861';
const roleCarry = {
  run: function (creep, index = 0) {
    const Length = pointes.length
    // 工人的可存储空间
    const freeCapacity = creep.store.getFreeCapacity()
    // 如果存储空间为0，则应该去送货
    if (freeCapacity == 0) {
      creep.memory.carring = true
    }
    // 转移模式
    if (Memory.showTransfer && index === 0) {
      const sourceType = RESOURCE_ENERGY;
      const terminal = Game.getObjectById('60219ee55a1b60469b3c8861');

      if (freeCapacity == 0) {
        if (creep.transfer(terminal, sourceType) == ERR_NOT_IN_RANGE) {
          creep.moveTo(terminal);
        }
      } else {
        creep.say(freeCapacity)
        creep.getResourceByStructure();
      }

      return false;
    }

    // 从坑位里面拿货
    if (freeCapacity > 0 && !creep.memory.carring) {

      // 目标
      let  sources;
      try {
         sources = Game.getObjectById(pointes[index % Length].container)
      } catch (error) {
        // sources = Game.getObjectById(pointes[0].container)
        sources = Game.getObjectById(terminal);
      }

      // 当自己的坑位空了的时候，去别人的坑位
      if (sources.store.getUsedCapacity() == 0) {
        index++
        sources = Game.getObjectById(pointes[index % Length].container)
      }

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
      
      // FIND_TOMBSTONES
      // 有资源的墓碑
      const tombstones = creep.room.find(FIND_TOMBSTONES, {
        filter: (s) => s.store.getUsedCapacity() > 0
      });

      // 如果container空了，但是spaw和extension空着的，从storage里面拿
      if (isContainersEmtyp && isSpawnEmpty.length > 0) {
        creep.say('空啦')
        sources = Game.getObjectById(terminal)
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
      else {
        if (creep.withdraw(sources, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(sources);
        }
      }
    } else {
      // const isFu = creep.isStructureFull([STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_TOWER]);
      // console.log(isFu)
      // 给建筑充能,存放资源
      const isFull = creep.sendRourceToStructure([STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_TOWER], index % 2 === 0)


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

    // try {
    //   const sdsd = creep.findClosestBatch([STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_TOWER, STRUCTURE_STORAGE]);
    // } catch (error) {
    //   console.log(error)
    // }

  },
};

module.exports = roleCarry;