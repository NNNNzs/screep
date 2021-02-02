// var tower = Game.getObjectById('');
const tower = [].map(id => Game.getObjectById(id))

module.exports = {
  run() {
    if (tower) {
      // 待修复的建筑

      const closestDamagedStructure = tower[0].pos.findClosestByRange(FIND_STRUCTURES, {
        filter: (structure) => structure.hits + 200 < structure.hitsMax && structure.structureType !== STRUCTURE_WALL
      })
      // 攻击
      const closestHostile = tower[0].pos.findClosestByRange(FIND_HOSTILE_CREEPS);

      if (closestDamagedStructure) {
        tower[0].repair(closestDamagedStructure);
      }

      // 攻击
      if (closestHostile) {
        // Game.notify(`敌人出现在你的房间${Game.time}`)
        // console.log(`敌人出现在你的房间${Game.time}`)
        tower.forEach(t => t.attack(closestHostile))
      }
    }
  }
}