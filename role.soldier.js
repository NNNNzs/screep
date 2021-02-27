
const downRoom = new RoomPosition(31, 1, 'W24S34');

module.exports = {
  soliderRun(){

  },
  dockerRun(){
    
  },
  run(creep) {
    // const target = creep.pos.findClosestByRange(FIND_HOST);

    const target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if (!target) {
      creep.moveTo(downRoom);
    }
    if (target) {
      if (creep.attack(target) == ERR_NOT_IN_RANGE) {
        creep.moveTo(target);
      };
    }
    // 自我治疗
    const healNumber = creep.getActiveBodyparts(HEAL) * 12;
    const lowHits = creep.hits + healNumber +120 < creep.hitsMax;
    if (lowHits) {
      creep.heal(creep)
    }
  }
}