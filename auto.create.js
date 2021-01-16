
const sourceMap = {
  [MOVE]: {
    cost: 50,
    move: -2
  },
  [WORK]: {
    cost: 100,
  },
  [CARRY]: {
    cost: 50,
  },
  [ATTACK]: {
    cost: 80
  },
  [RANGED_ATTACK]: {
    cost: 150
  },
  [HEAL]: {
    cost: 250
  },
  [CLAIM]: {
    cost: 600
  },
  [TOUGH]: {
    cost: 10
  }
}
function getCost(list) {
  console.log()
  let sum = 0;
  _.forEach(list, (part) => {
    sum += sourceMap[part].cost
  })
  return sum
}
function createHarvester() {
  //创建一个工人
  const part = [WORK, WORK, CARRY, MOVE, WORK, MOVE, WORK]
  const code = Game.spawns['Spawn1'].spawnCreep(part,
    `Harvester${Game.time}`, {
    memory: { role: 'harvester' }
  })
  console.log('createHarvester' + code)
}

function createUpgrader() {
  // 升级者
  const part = [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE]
  const spawn = Game.spawns['Spawn1']
  const code = spawn.spawnCreep(part,
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
function createOnlyHarvester(index) {
  Game.spawns['Spawn1'].spawnCreep([WORK, MOVE, WORK, WORK, WORK, WORK],
    `work${index}`, {
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

function autoCreate(name, spawns = 'Spawn1') {
  const body = creepsList[name].body;
  const code = Game.spawns[spawns].spawnCreep(body,
    `${name}${Game.time}`, {
    memory: { role: 'repair' }
  });
  const rome = Game.spawns[spawns].room;
  if (code == -6) {
    const str = `create ${name} fail ${rome.energyAvailable}/${room.energyCapacityAvailable}`
    console.log(str)
  }
}

let creepsList = {
  harvester: {
    sum: 2,
    current: 0,
    body: [WORK, MOVE, WORK, WORK, WORK, WORK]
  },
  carry: {
    sum: 4,
    current: 0,
    body: [WORK, MOVE, CARRY, CARRY, MOVE, MOVE, WORK]
  },
  upgrader: {
    sum: 2,
    current: 0,
    body: [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE]
  },
  builder: {
    sum: 3,
    current: 0,
    body: [WORK, CARRY, CARRY, MOVE, WORK, MOVE]
  },
  repair: {
    sum: 1,
    current: 0,
    body: [WORK, WORK, CARRY, CARRY, MOVE, MOVE]
  }
}
module.exports.run = () => {

  _.forEach(Game.creeps, creep => {
    const role = creep.memory.role;
    // console.log(role)
    // creepsList[role].current++;
    // creepsList[creep.memory.role].current++;
  })

  const harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
  const onlyHarvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'onlyHarvester');
  const carryers = _.filter(Game.creeps, (creep) => creep.memory.role == 'carry');
  const upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
  const builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
  const repairs = _.filter(Game.creeps, (creep) => creep.memory.role == 'repair');

  if (Game.time % 100 === 0) {
    deleteCreepMemory()
  }
  // 收割者数量
  if (harvesters.length < 2) {
    createHarvester()
  }
  else if (onlyHarvesters.length < 2) {
    createOnlyHarvester(onlyHarvesters.length - 1)
  }
  else if (carryers.length < 4) {
    createCarry()
  }
  else if (repairs.length < 1) {
    createRepair()
  }
  else if (upgraders.length < 5) {
    createUpgrader()
  }
  else if (builders.length < 2) {
    createBuilder()
  }
};