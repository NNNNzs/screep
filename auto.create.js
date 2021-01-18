
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
    index: 0,
    sum: 2,
    current: 0,
    createBeforeDied: 70,
    body: [MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK]
  },
  carry: {
    index: 1,
    sum: 4,
    current: 0,
    createBeforeDied: 10,
    body: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE]
  },
  upgrader: {
    index: 2,
    sum: 3,
    current: 10,
    body: [CARRY, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]
  },
  builder: {
    index: 3,
    sum: 2,
    current: 0,
    body: [CARRY, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]
  },
  repair: {
    index: 4,
    sum: 0,
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
  const str = `${room.energyAvailable}/${room.energyCapacityAvailable}but ${sum} ${calcMove(bodys)}tick/move`
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

function autoCreate(creepName, spawns = 'Spawn1') {
  // 拷贝一份
  let creepsMap = Object.assign({}, creepsList)
  const body = creepsMap[creepName].body;
  const code = Game.spawns[spawns].spawnCreep(body,
    `${creepName}${Game.time.toString(16)}`, {
    memory: { role: creepName }
  });
  const room = Game.spawns[spawns].room;
  // 能量不够
  if (code == -6) {
    const cost = getCost(body)
    const str = `create ${creepName} fail ${room.energyAvailable}/${room.energyCapacityAvailable}but ${cost}`
    console.log(str)
  }
}


module.exports.run = () => {
  // let currentCreep = Object.assign({},creepsList)
  let currentCreep = _.cloneDeep(creepsList)

  // 计算当前场上 有多少个creep
  _.forEach(Game.creeps, creep => {
    const role = creep.memory.role;
    // 如果有一个快死了，那么这个tick就立即创建
    if(currentCreep[role].createBeforeDied && (creep.ticksToLive < currentCreep[role].createBeforeDied)){
      currentCreep[role].createNow = true
    }
    // 场上的creep计数
    currentCreep[role].current++;
  })
  // 按照队列里面来计数
  // const ll = Object.keys(creepsList)
  // console.log(JSON.stringify(ll))
  Object.keys(creepsList).some(creepName => {
    const role = currentCreep[creepName]
    if (role.createNow) {
      console.log(` shoud create now ${creepName}`)
      autoCreate(creepName)
      return true;
    }
    if (role.sum > role.current) {
      // console.log('should create ' + creepName)
      autoCreate(creepName)
      return true;
    } else {
      return false;
    }
  });

  if (Game.time % 400 === 0) {
    deleteCreepMemory()
  }

  // console.log(JSON.stringify(currentCreep))

  // const harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
  // const carryers = _.filter(Game.creeps, (creep) => creep.memory.role == 'carry');
  // const upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
  // const builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
  // const repairs = _.filter(Game.creeps, (creep) => creep.memory.role == 'repair');

  // if (Game.time % 400 === 0) {
  //   deleteCreepMemory()
  // }
  // // 收割者数量
  // if (carryers.length < 4) {
  //   createCarry()
  // }
  // else if (harvesters.length < 2) {
  //   createHarvester(harvesters.length)
  // }

  // // else if (repairs.length < 1) {
  // //   createRepair()
  // // }
  // else if (upgraders.length < 2) {
  //   createUpgrader()
  // }
  // else if (builders.length < 2) {
  //   createBuilder()
  // }
};