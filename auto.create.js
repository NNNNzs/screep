
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
    body: [WORK, MOVE, WORK, WORK, WORK, WORK]
  },
  carry: {
    sum: 4,
    current: 0,
    body: [CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE,MOVE]
  },
  upgrader: {
    sum: 2,
    current: 0,
    body: [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE]
  },
  builder: {
    sum: 3,
    current: 0,
    body: [WORK, CARRY, CARRY, MOVE, WORK, MOVE, WORK, CARRY, WORK, MOVE]
  },
  repair: {
    sum: 1,
    current: 0,
    body: [WORK, WORK, CARRY, CARRY, MOVE, MOVE]
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
// 计算移动力
const calcMove = (bodys) => {
  let sum = 0;
  _.forEach(bodys, (body) => {
    if (body === MOVE) {
      sum += 1;
    } else {
      sum -= 1;
    }
  })
  return sum;
}

getCost(creepsList.carry.body)

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
  const code = Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, CARRY, MOVE, WORK, MOVE, WORK, CARRY, WORK, MOVE],
    `Builder1${Game.time}`, {
    memory: { role: 'builder' }
  });
  console.log('createBuilder' + code)
}
// 资产转移
function createCarry() {
  const body = creepsList.carry.body;
  const code = Game.spawns['Spawn1'].spawnCreep(body,
    `carry1${Game.time}`, {
    memory: { role: 'carry' }
  });
  console.log('createcarry' + code)
}
function createOnlyHarvester(index) {
  const code = Game.spawns['Spawn1'].spawnCreep([WORK, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK],
    `work${index}`, {
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
  let creepsMap = Object.assign({}, creepsList)
  const body = creepsMap[name].body;
  const code = Game.spawns[spawns].spawnCreep(body,
    `${name}${Game.time}`, {
    memory: { role: 'repair' }
  });
  const room = Game.spawns[spawns].room;
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
  const onlyHarvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'onlyHarvester');
  const carryers = _.filter(Game.creeps, (creep) => creep.memory.role == 'carry');
  const upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
  const builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
  const repairs = _.filter(Game.creeps, (creep) => creep.memory.role == 'repair');

  if (Game.time % 100 === 0) {
    deleteCreepMemory()
  }
  // 收割者数量
  if (harvesters.length < 1) {
    createHarvester()
  }
  else if (onlyHarvesters.length < 2) {
    createOnlyHarvester(onlyHarvesters.length - 1)
  }
  else if (carryers.length < 5) {
    createCarry()
  }
  else if (repairs.length < 1) {
    createRepair()
  }
  else if (upgraders.length < 3) {
    createUpgrader()
  }
  else if (builders.length < 4) {
    createBuilder()
  }
};