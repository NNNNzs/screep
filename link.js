var tower = Game.getObjectById('6001fb3902531a28552a968f');

module.exports = {
  run() {
    if (tower) {
      // 
      // Game.map.visual.circle(tower.pos);

      // 修复建筑
      const closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: (structure) => structure.hits + 200 < structure.hitsMax && structure.structureType !== STRUCTURE_WALL
      });
      // 攻击
      const closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
      if (closestDamagedStructure) {
        tower.repair(closestDamagedStructure);
      }
      const closeHeal = '';


      if (closestHostile) {
        Game.notify(`敌人出现在你的房间${Game.time}`)
        console.log(`敌人出现在你的房间${Game.time}`)
        tower.attack(closestHostile);
        // Game.ms
      }
    }
  }
}