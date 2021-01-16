// 更改角色
Game.creeps['Harvester1'].memory.role = 'harvester';
Game.creeps['Upgrader1'].memory.role = 'upgrader';

// 无情的工作机器
Game.spawns['Spawn1'].spawnCreep([WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE],
  'HarvesterBig', {
  memory: { role: 'harvester' }
});

// 自杀
Game.creeps['Harvester1'].suicide()

// 开启安全模式
Game.spawns['Spawn1'].room.controller.activateSafeMode();

// 建造防御塔
Game.spawns['Spawn1'].room.createConstructionSite(23, 22, STRUCTURE_TOWER);

// 获取对象
const tower = Game.getObjectById('5ffe87b7f5b7a0123e21d246');
tower.room.energyAvailable

// 每个资源周围9*9都是采集位
// 给harvester标号，利用取余平均分配工人