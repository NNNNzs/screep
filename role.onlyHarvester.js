// 只会采集的采集者
const showDash = { visualizePathStyle: { stroke: '#ffaa00' } }
const pointes = [
  { source: '5bbcabec9099fc012e634838', container: '6001be72ddc08054e4138598' },
  { source: '5bbcabec9099fc012e634837', container: '60023bf0cf2cfd35125f818a' }
  // {source:'5bbcabec9099fc012e634835',container:'6003b2b38c437ef0858d1d81'}
]

const onlyHarvester = {
  run(creep, index = 0) {
    // 挖矿 
    const sources = Game.getObjectById(pointes[index].source);
    const container = Game.getObjectById(pointes[index].container)
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