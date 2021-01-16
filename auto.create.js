
function createHarvester() {
  //创建一个工人
  const code = Game.spawns['Spawn1'].spawnCreep([WORK, WORK, CARRY, MOVE, WORK, MOVE, WORK],
    `Harvester${Game.time}`, {
    memory: { role: 'harvester' }
  })
  console.log('createHarvester' + code)
}

function createUpgrader() {
  // 升级者
  const code = Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, MOVE, MOVE, CARRY, MOVE],
    `Upgrader${Game.time}`, {
    memory: { role: 'upgrader' }
  });
  console.log('createUpgrader ' + code)
}

function createBuilder() {
  //建造者 
  const code = Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, CARRY, MOVE, WORK, MOVE],
    `Builder1${Game.time}`, {
    memory: { role: 'builder' }
  });
  console.log('createBuilder' + code)
}
// 资产转移
function createCarry() {
  const code = Game.spawns['Spawn1'].spawnCreep([WORK, MOVE, CARRY, CARRY, MOVE, MOVE, WORK],
    `carry1${Game.time}`, {
    memory: { role: 'carry' }
  });
  console.log('createcarry' + code)
}
function createOnlyHarvester() {
  Game.spawns['Spawn1'].spawnCreep([WORK, MOVE, WORK, WORK, WORK, WORK],
    `work1`, {
    memory: { role: 'onlyHarvester' }
  });
}
function createRepair() {
  const code = Game.spawns['Spawn1'].spawnCreep([WORK, WORK, CARRY, CARRY, MOVE, MOVE],
    `repair`, {
    memory: { role: 'repair' }
  });
  console.log('create repair' + code)

}


function deleteCreepMemory() {
  for (var name in Memory.creeps) {
    if (!Game.creeps[name]) {
      delete Memory.creeps[name];
    }
  }
}
module.exports.run = () => {
  const harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
  const upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
  const builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
  const carryers = _.filter(Game.creeps, (creep) => creep.memory.role == 'carry');
  const onlyHarvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'onlyHarvester');
  const repairs = _.filter(Game.creeps, (creep) => creep.memory.role == 'repair');
  if (Game.time % 100 === 0) {
    deleteCreepMemory()
  }
  // 收割者数量
  if (harvesters.length < 3) {
    createHarvester()
  }
  else if (onlyHarvesters.length < 1) {
    createOnlyHarvester()
  }
  else if (carryers.length < 3) {
    createCarry()
  }
  else if (repairs.length < 1) {
    createRepair()
  }
  else if (upgraders.length < 2) {
    createUpgrader()
  }
  else if (builders.length < 2) {
    createBuilder()
  }
};