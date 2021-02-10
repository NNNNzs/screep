// 只会采集的采集者
const showDash = { visualizePathStyle: { stroke: '#ffaa00' } }
const pointes = [
  { source: '5bbcab9b9099fc012e633f27', container: '601ab37d84c3c11bf26dd607' },
  { source: '5bbcab9b9099fc012e633f26', container: '601ab97484c3c14f2f6dd7bd' },
  // { source: '5bbcb23f40062e4259e93814', container: '600c45f146267590a0dc3aeb' },
]
const L = pointes.length
const onlyHarvester = {
  run(creep,index) {
    const i = index%pointes.length;
    const newAutoIndex = creep.memory.autoIndex;
    // 挖矿 
    const sources = Game.getObjectById(pointes[i].source);
    const container = Game.getObjectById(pointes[i].container)
    // 移动到这个点
    if (creep.pos.isEqualTo(container)) {
      if (container.store.getFreeCapacity() == 0) {
        creep.say('偷懒')
      } else {
        creep.harvest(sources)
      }
    } else {
      creep.say('moving!')
      creep.moveTo(container.pos, showDash);
    }
  }
};
module.exports = onlyHarvester;