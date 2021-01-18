var tower = Game.getObjectById('6001fb3902531a28552a968f');

module.exports = {
  run() {
    if (tower) {
      // 
      // Game.map.visual.circle(tower.pos);

      // 修复建筑
      var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: (structure) => structure.hits + 200 < structure.hitsMax && structure.structureType !== STRUCTURE_WALL
      });
      if (closestDamagedStructure) {
        tower.repair(closestDamagedStructure);
      }
      // 攻击
      var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
      if (closestHostile) {
        Game.notify('敌人出现在你的房间')
        tower.attack(closestHostile);
        // Game.ms
      }
    }
  }
}