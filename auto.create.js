
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
const createBody = (data = {}) => {
  let bodys = [];
  Object.keys(data).forEach(ele => {
    let n = 0;
    while (n < data[ele]) {
      bodys.push(ele)
      n++
    }
  })
  return bodys;
}
const creepsList = {
  carry: {
    index: 1,
    sum: 2,
    current: 0,
    createBeforeDied: 10,
    body: createBody({
      [CARRY]: 2,
      [MOVE]: 2
    })
  },
  harvester: {
    index: 0,
    sum: 2,
    current: 0,
    createBeforeDied: 0,
    body: createBody({
      [MOVE]: 2,
      [WORK]: 4,
      [CARRY]: 0,
    })
  },
  work: {
    index: 1,
    sum: 0,
    current: 0,
    createBeforeDied: 10,
    body: createBody({
      [CARRY]: 2,
      [WORK]: 1,
      [MOVE]: 2
    })
  },
  upgrader: {
    index: 2,
    sum: 3,
    current: 0,
    body: createBody({
      [CARRY]: 4,
      [WORK]: 2,
      [MOVE]: 5
    })
  },
  builder: {
    index: 3,
    sum: 3,
    current: 0,
    createBeforeDied: 10,
    body: createBody({
      [CARRY]: 2,
      [WORK]: 2,
      [MOVE]: 3
    })
  },
  repair: {
    index: 4,
    sum: 1,
    current: 0,
    body: createBody({
      [CARRY]: 1,
      [WORK]: 1,
      [MOVE]: 2
    })
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

function deleteCreepMemory() {
  for (var name in Memory.creeps) {
    if (!Game.creeps[name]) {
      delete Memory.creeps[name];
    }
  }
}

function autoCreate(creepName, autoIndex = -1, spawns = 'Spawn1',) {
  // 拷贝一份
  let creepsMap = Object.assign({}, creepsList)
  const body = creepsMap[creepName].body;
  const sum = creepsMap[creepName].sum;

  // todo 自动编号
  if (autoIndex === -1) {
    autoIndex = Object.keys(Memory.creeps).filter(name => Memory.creeps[name].role === creepName).length;
    // 当前存货的工人，他们的自增索引
    // const autoIndexs = Object.keys(Memory.creeps).filter(name => Memory.creeps[name].role === creepName).map(name=>Memory.creeps[name].autoIndex).filter(e=>e);
    // autoIndexs.sort();

    // 需要创建的索引
    // const sumIndexs = new Array(sum).fill('').map((ele,index)=>index);

    // console.log(autoIndexs)
    // autoIndex = creepsMap[creepName].

    // console.log(creeps)
    // while(autoIndex<sum)
  }


  const code = Game.spawns[spawns].spawnCreep(body,
    `${creepName}${Game.time.toString(16)}`, {
    memory: { role: creepName, autoIndex }
  });
  const room = Game.spawns[spawns].room;
  // 能量不够
  if (code == -6) {
    const cost = getCost(body)
    const str = `create ${creepName} fail ${room.energyAvailable}/${room.energyCapacityAvailable}but ${cost}`
    console.log(str)
  } else {
    console.log(code)
  }
  deleteCreepMemory()
}


module.exports.run = () => {
  let currentCreep = _.cloneDeep(creepsList)

  // 计算当前场上 有多少个creep
  _.forEach(Game.creeps, creep => {
    const role = creep.memory.role;
    // 如果有一个快死了，那么这个tick就立即创建
    if (currentCreep[role].createBeforeDied && (creep.ticksToLive < currentCreep[role].createBeforeDied)) {
      currentCreep[role].createNow = creep.memory.autoIndex
    }
    // 场上的creep计数
    currentCreep[role].current++;
  })

  Object.keys(creepsList).some(creepName => {
    const role = currentCreep[creepName]
    if (role.createNow) {
      console.log(` shoud create ${creepName} now`)
      autoCreate(creepName,role.createNow)
      return true;
    }
    if (role.sum > role.current) {
      console.log('should create ' + creepName)
      autoCreate(creepName)
      return true;
    } else {
      return false;
    }
  });

  if (Game.time % 400 === 0) {
    deleteCreepMemory()
  }
};
