var tower = Game.getObjectById('4b27c7b707e508ce2e9c338b');
if (tower) {
  var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
    filter: (structure) => structure.hits < structure.hitsMax
  });
  if (closestDamagedStructure) {
    tower.repair(closestDamagedStructure);
  }

  var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
  if (closestHostile) {
    tower.attack(closestHostile);
  }
}