// 只会采集的采集者
const showDash = { visualizePathStyle: { stroke: '#ffaa00' } }
const p = { x: 18, y: 8 }
const pointes = [
  { source: '5bbcabec9099fc012e634838', container: '6001be72ddc08054e4138598' },
  { source: '5bbcabec9099fc012e634837', container: '60023bf0cf2cfd35125f818a' }
]
const onlyHarvester = {
  run(creep, index) {
    // 挖矿 
    const sources = Game.getObjectById('5bbcabec9099fc012e634838');
    const container = Game.getObjectById('6001be72ddc08054e4138598')
    // 移动到这个点
    if (creep.pos.isEqualTo(p.x, p.y)) {
      if (container.store.getFreeCapacity() == 0) {
        creep.say('偷懒')
      } else {
        creep.harvest(sources)
      }
    } else {
      creep.say('moving!')
      creep.moveTo(p.x, p.y, showDash);
    }
  }
};
module.exports = onlyHarvester;