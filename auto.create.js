
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
  work: {
    index: 1,
    sum: 0,
    current: 0,
    createBeforeDied: 10,
    body: createBody({
      [CARRY]: 4,
      [WORK]: 4,
      [MOVE]: 5,
      [HEAL]:2,
    })
  },
  harvester: {
    index: 0,
    sum: 2,
    current: 0,
    createBeforeDied: 20,
    body: createBody({
      [MOVE]: 8,
      [WORK]: 9,
    })
  },
  carry: {
    index: 0,
    sum: 2,
    current: 0,
    createBeforeDied: 20,
    body: createBody({
      [CARRY]: 18,
      [MOVE]: 17
    })
  },
  
  builder: {
    index: 3,
    sum: 1,
    current: 0,
    createBeforeDied: 10,
    body: createBody({
      [CARRY]: 12,
      [WORK]: 12,
      [MOVE]: 24,
    })
  },
  upgrader: {
    index: 4,
    sum: 1,
    current: 0,
    createBeforeDied: 10,
    body: createBody({
      [CARRY]: 2,
      [WORK]: 2,
      [MOVE]: 4
    })
  },
  soldier:{
    sum:0,
    current: 0,
    body:createBody({
      [TOUGH]:2,
      [RANGED_ATTACK]:11,
      [HEAL]:9,
      [MOVE]:24,
    })
  },
  doctor:{
    sum:0,
    current: 0,
    body:createBody({
      [HEAL]:5,
      [MOVE]:5,
    })
  },
  repair: {
    index: 4,
    sum: 1,
    current: 0,
    body: createBody({
      [CARRY]: 5,
      [WORK]: 6,
      [MOVE]: 10
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
module.exports.getCost = getCost;

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
    // 还活着的的名单
    const liveList = Object.keys(Memory.creeps).filter(name => Memory.creeps[name].role === creepName).map(creep => Memory.creeps[creep].autoIndex)

    // 求第一个不连续的数
    const sumList = Array.from({ length: sum }).map((e, index) => index);

    autoIndex = sumList.find(index => !liveList.includes(index))

  }


  const code = Game.spawns[spawns].spawnCreep(body,
    `${creepName}${Game.time.toString(16)}`, {
    memory: { role: creepName, autoIndex },
    directions:[BOTTOM]
  });
  const room = Game.spawns[spawns].room;
  // 能量不够
  if (code == -6) {
    const cost = getCost(body)
    const str = `create ${creepName} fail ${room.energyAvailable}/${room.energyCapacityAvailable}but ${cost}`
    console.log(str)
  } else {
    // console.log(code)
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
    // 是否超生
    const beyondSum = role.current + 1 > role.sum
    // 立即创建
    if (!beyondSum && (role.createNow>=0)) {
      autoCreate(creepName, role.createNow)
      return true;
    }
    // 死亡创建，阻塞创建
    if (role.sum > role.current) {
      autoCreate(creepName)
      return true;
    } else {
      return false;
    }
  });

  if (Game.time % 400 === 0) {
    deleteCreepMemory()
  }
  // renew逻辑
  Object.keys(Game.spawns).forEach(s=>{
    const spawn =  Game.spawns[s]
    const creeps = spawn.pos.findInRange(FIND_MY_CREEPS,1).filter(creeps=>creeps.ticksToLive<800);
    if(creeps.length>0){
      const creep = creeps[0]
      const code = spawn.renewCreep(creep);
      creep.say(creep.ticksToLive)
    }
  })
};
