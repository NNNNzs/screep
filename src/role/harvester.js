// 只会采集的采集者
const showDash = { visualizePathStyle: { stroke: '#ffaa00' } }
const pointes = [
  { source: '5bbcab9b9099fc012e633f27' },
  { source: '5bbcab9b9099fc012e633f26' },
  // { source: '5bbcb23f40062e4259e93814', container: '600c45f146267590a0dc3aeb' },
]
const L = pointes.length
const onlyHarvester = {
  run(creep, index) {
    const i = index % pointes.length;
    // 挖矿 
    try {
      const sources = Game.getObjectById(pointes[i].source);
      const container = Game.getObjectById(Memory.containerList[i].id);
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
    } catch (error) {

    }

  }
};
export default  onlyHarvester;