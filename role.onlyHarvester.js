// 只会采集的采集者
const showDash = { visualizePathStyle: { stroke: '#ffaa00' } }
const pointes = [
  { source: '5bbcabec9099fc012e634837', container: '6004f9ce3f6e2c29a1dd9325' },
  { source: '5bbcabec9099fc012e634838', container: '6004ff8ff9b4b3c6f2c61684' },
  { source: '5bbcb23f40062e4259e93814', container: '600c45f146267590a0dc3aeb' },
]
const L = pointes.length
const onlyHarvester = {
  run(creep, index = 0) {
    const i = index%L
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