
const showDash = { visualizePathStyle: { stroke: '#ffaa00' } }
const { findResourceStructure, findEmptyStructure } = require('tools')
const creepExtension = {
  // 从建筑物里面拿出资源
  getResourceByStructure(rank = [STRUCTURE_CONTAINER, STRUCTURE_EXTENSION, STRUCTURE_SPAWN]) {
    const sources = findResourceStructure(this, rank);
    if (this.withdraw(sources[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      this.moveTo(sources[0], showDash);
    }
  },
  // 将资源送到建筑物
  sendRourceToStructure(rank = [STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_CONTAINER], flag) {
    const sources = findEmptyStructure(this, rank);
    if (this.transfer(sources[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      this.moveTo(sources[0], showDash);
    }
  },
  // 挖矿
  self_harvest(index = 0) {
    const sources = this.room.find(FIND_SOURCES);
    if (this.harvest(sources[index % 2]) == ERR_NOT_IN_RANGE) {
      this.moveTo(sources[index % 2], showDash);
    }
  },
  // 修复建筑
  fixing() {
    // 如果身上还有能量，一次性用完
    if (this.store.getUsedCapacity() > 0&& this.memory.objId) {
      const toFixObj = Game.getObjectById(this.memory.objId)
      this.repair(toFixObj);
      this.say('biubiubiu')
      if(toFixObj.hits===toFixObj.hitsMax){
        this.memory.objId = null
      }

      return false;
    }
    const targets = this.room.find(FIND_STRUCTURES, {
      filter: object => object.hits < object.hitsMax
    });
    // 升序
    targets.sort((a, b) => a.hits - b.hits);

    if (targets.length > 0) {
      if (this.repair(targets[0]) == ERR_NOT_IN_RANGE) {
        this.moveTo(targets[0], { visualizePathStyle: { fill: '#000000' } });
      }
      if (this.pos.inRangeTo(targets[0],3)) {
        this.memory.objId = targets[0].id;
        this.say('biubiubiu')
      }
    } else {
      this.say('偷懒中')
    }
  }
}
// 挂载所有的额外属性和方法
module.exports = function () {
  console.log('mounted')
  _.assign(Creep.prototype, creepExtension)

  // mountFlag()
  // mountRoom()
  // 其他更多拓展...
}