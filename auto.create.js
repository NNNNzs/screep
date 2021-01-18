
const sourceMap = {
  [MOVE]: {
    cost: 50,
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
const creepsList = {
  harvester: {
    sum: 2,
    current: 0,
    body: [MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,WORK,WORK]
  },
  carry: {
    sum: 4,
    current: 0,
    body: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE]
  },
  upgrader: {
    sum: 2,
    current: 0,
    body: [CARRY, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]
  },
  builder: {
    sum: 3,
    current: 0,
    body: [CARRY, CARRY, CARRY, WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE, MOVE]
  },
  repair: {
    sum: 1,
    current: 0,
    body: [CARRY, CARRY, CARRY, WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE, MOVE]
  }
}
const getCost = (bodys) => {
  let sum = 0;
  _.forEach(bodys, (part) => {
    sum += sourceMap[part].cost
  })
  const room = Game.spawns['Spawn1'].room;
  const str = `${room.energyAvailable}/${room.energyCapacityAvailable}but ${sum} move${calcMove(bodys)}`
  console.log(str)
  return sum
}
// 计算移动力，返回值表示满载的情况下多少tick移动一个格子
const calcMove = (bodys) => {
  let sum = 1;
  _.forEach(bodys, (body) => {
    if (body === MOVE) {
      sum -= 1;
    } else {
      sum += 1;
    }
  })
  return sum;
}

getCost(creepsList.harvester.body)
function createHarvester(index) {
  const body = creepsList.harvester.body;
  const code = Game.spawns['Spawn1'].spawnCreep(body,
    `harvester${index}`, {
    memory: { role: 'harvester' }
  });
  console.log('harvester ' + code)
}

function createUpgrader() {
  // 升级者
  const part = creepsList.upgrader.body;
  const spawn = Game.spawns['Spawn1']
  const code = spawn.spawnCreep(part,
    `Upgrader${Game.time}`, {
    memory: { role: 'upgrader' }
  });
  console.log('createUpgrader ' + code)
}

function createBuilder() {
  //建造者 
  const body = creepsList.builder.body;
  const code = Game.spawns['Spawn1'].spawnCreep(body,
    `Builder${Game.time}`, {
    memory: { role: 'builder' }
  });
  console.log('createBuilder' + code)
}
// 资产转移
function createCarry() {
  const body = creepsList.carry.body;
  const code = Game.spawns['Spawn1'].spawnCreep(body,
    `carry${Game.time}`, {
    memory: { role: 'carry' }
  });
  console.log('createcarry' + code)
}
function createOnlyHarvester(index) {
  const body = creepsList.harvester.body;
  const code = Game.spawns['Spawn1'].spawnCreep(body,
    `harvester${index}`, {
    memory: { role: 'onlyHarvester' }
  });
  console.log(code)
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
  // 拷贝一份
  let creepsMap = Object.assign({}, creepsList)
  const body = creepsMap[name].body;
  const code = Game.spawns[spawns].spawnCreep(body,
    `${name}${Game.time}`, {
    memory: { role: 'repair' }
  });
  const room = Game.spawns[spawns].room;
  // 能量不够
  if (code == -6) {
    const cost = getCost(body)
    const str = `create ${name} fail ${room.energyAvailable}/${room.energyCapacityAvailable}but ${cost}`
    console.log(str)
  }
}


module.exports.run = () => {

  // _.forEach(Game.creeps, creep => {
  //   const role = creep.memory.role;
  //   // console.log(role)
  //   // creepsList[role].current++;
  //   // creepsList[creep.memory.role].current++;
  // })

  const harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
  const carryers = _.filter(Game.creeps, (creep) => creep.memory.role == 'carry');
  const upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
  const builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
  const repairs = _.filter(Game.creeps, (creep) => creep.memory.role == 'repair');

  if (Game.time % 400 === 0) {
    deleteCreepMemory()
  }
  // 收割者数量
  if (carryers.length < 4) {
    createCarry()
  }
  else if (harvesters.length < 2) {
    createHarvester(harvesters.length)
  }

  // else if (repairs.length < 1) {
  //   createRepair()
  // }
  else if (upgraders.length < 2) {
    createUpgrader()
  }
  else if (builders.length < 2) {
    createBuilder()
  }
};