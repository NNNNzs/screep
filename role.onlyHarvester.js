// 只会采集的采集者
const showDash = { visualizePathStyle: { stroke: '#ffaa00' } }
const pointes = [
  { source: '5bbcab9b9099fc012e633f27', container: '6016384c77f12f38ec1b14a5' },
  { source: '5bbcab9b9099fc012e633f26', container: '601658b66776c85cf0df8f2b' },
  // { source: '5bbcb23f40062e4259e93814', container: '600c45f146267590a0dc3aeb' },
]
const L = pointes.length
const onlyHarvester = {
  run(creep, index = 0) {
    const i = index % L
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