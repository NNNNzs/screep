
const downRoom = new RoomPosition(34, 2, 'W24S34');
const home = new RoomPosition(37,24,'W24S33');

module.exports = {
  run(creep) {
    // const target = creep.pos.findClosestByRange(FIND_HOST);
    // if(creep.ticksToLive<800){
    //   creep.moveTo(home)
    //   return false;
    // }
    const target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    // console.log(target)
    // const target = Game.getObjectById('5bbcab9b9099fc012e633f22')
    if (!target) {
      creep.moveTo(downRoom);
    }
    if (target) {
      const code = creep.rangedAttack(target);
      if (code == ERR_NOT_IN_RANGE) {
        creep.moveTo(target);
      };
    }
    
    // 自我治疗
    // const healNumber = creep.getActiveBodyparts(HEAL) * 14;
    const lowHits = creep.hits   < creep.hitsMax;
    if (lowHits) {
      creep.heal(creep)
    }
  }
}