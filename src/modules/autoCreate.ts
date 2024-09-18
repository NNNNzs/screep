import { BodyCreateMap, calcMove, log } from "../utils";
import { ROLE_NAME_ENUM, bodyCostMap, bodyRateMap } from "../var";

/**
 * 
 * @param {Object} data 
 * @description 根据一个对象，返回生成的body
 * @returns {Array}
 */
export const createBodyWithMap = (data: BodyCreateMap = {}): BodyPartConstant[] => {
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



export class SpawnQueue {
  _spanQueue: ROLE_NAME_ENUM[];

  public room: Room
  constructor(room: Room) {
    this.room = room
    this._spanQueue = Memory.rooms[room.name].spawnQueue || [];
  }

  /** 每次只生产一种这个类型 */
  push(roleName: ROLE_NAME_ENUM) {
    // 队列里没有才加
    if (this._spanQueue.indexOf(roleName) === -1) {
      this._spanQueue.push(roleName);
      return true
    }
    return false
  }
  shift() {
    this._spanQueue.shift();
  }

  get length() {
    return this._spanQueue.length;
  }
  first() {
    return this._spanQueue[0]
  }

  filter(cb) {
    return this._spanQueue.filter(cb)
  }
}


/**
 * @description 自动删除已经不存在的creep内存
 */
export function deleteCreepMemory() {
  for (var name in Memory.creeps) {
    if (!Game.creeps[name]) {
      delete Memory.creeps[name];
    }
  }
}

const createWorker = (spawnQueue: SpawnQueue) => {

  const roomName = spawnQueue.room.name;


  const totalScreep = Object.keys(Game.creeps);
  // 全局为空
  if (totalScreep.length === 0) {
    spawnQueue.push(ROLE_NAME_ENUM.worker);
  }

  // 小于设定值
  const workers = totalScreep.filter(creepName => {
    const creep = Game.creeps[creepName];
    return creep.memory.role === ROLE_NAME_ENUM.worker;
  });

  const hasHarvester = Memory.rooms[roomName].harvestersLength > 0 ? 1 : 0;
  const hasCarry = Memory.rooms[roomName].carrysLength > 0 ? 1 : 0

  const workerLength = spawnQueue.room.memory.maxWorker - hasHarvester - hasCarry;

  console.log('workers', workers.length, 'w', workerLength, 'h', hasHarvester, 'c', hasCarry)

  if (workers.length < workerLength) {
    spawnQueue.push(ROLE_NAME_ENUM.worker);
  }
}


const createCarry = (spawnQueue: SpawnQueue) => {
  const storage = spawnQueue.room.storage;
  const roomName = spawnQueue.room.name;
  const totalScreep = Object.keys(Game.creeps);


  const carrys = totalScreep.filter(creepName => {
    const creep = Game.creeps[creepName];
    return creep.memory.role === ROLE_NAME_ENUM.carry;
  });

  Memory.rooms[roomName].carrysLength = carrys.length;


  if (storage && carrys.length < 1) {
    spawnQueue.push(ROLE_NAME_ENUM.carry);
  }

}

const createHarvester = (spawnQueue: SpawnQueue) => {
  const roomName = spawnQueue.room.name;
  const roomMemory = Memory.rooms[roomName]

  const totalScreep = Object.keys(Game.creeps);


  const harvesters = totalScreep.filter(creepName => {
    const creep = Game.creeps[creepName];
    return creep.memory.role === ROLE_NAME_ENUM.harvester;
  });

  Memory.rooms[roomName].harvestersLength = harvesters.length;

  const sourceList = roomMemory.sourcesList;

  if (harvesters.length < sourceList.length) {
    spawnQueue.push(ROLE_NAME_ENUM.harvester)
  }




}

/**
 * 
 * @param roleName 
 * @param spawn 
 * @description 动态规划，根据角色选择body按照一定配比
 * @returns 
 */
export const createBody = (roleName: ROLE_NAME_ENUM, spawn: StructureSpawn) => {
  const bodys = bodyRateMap[roleName];
  const moveCost = bodyCostMap[MOVE].cost;

  let available = spawn.room.energyAvailable;

  let bodyMap: BodyCreateMap = {
    [MOVE]: 0,
    [WORK]: 0,
    [CARRY]: 0,
    [ATTACK]: 0,
    [RANGED_ATTACK]: 0,
    [HEAL]: 0,
    [CLAIM]: 0,
    [TOUGH]: 0,
  };

  // 先保证最小值
  const bodysWithMin = bodys.filter(t => t?.min > 0);

  bodysWithMin.forEach(t => {
    const body = t.body;
    const min = t.min;
    bodyMap[body] += min;
    available = available - bodyCostMap[body].cost * min;

    bodyMap[MOVE] += min;
    available = available - moveCost * min;

  });

  let body = _.cloneDeep(bodys);

  // 开始贪心算法
  function addBody() {
    let resetBody = body.filter(t => t?.weight > 0);

    if (resetBody.length == 0) {
      body = _.cloneDeep(bodys);
      resetBody = body.filter(t => t?.weight > 0);
    }

    for (let i = 0; i < resetBody.length; i++) {
      const t = resetBody[i];

      if (bodyMap[t.body] > t.max) {
        return false
      };

      const newCost = bodyCostMap[t.body].cost;

      // 可以添加其他部件
      if (available - newCost < 0) {
        return false
      }

      bodyMap[t.body] += 1;
      available = available - bodyCostMap[t.body].cost;
      // 权重-1
      t.weight = t.weight - 1;

      // 添加mMove部件
      if (available - moveCost < 0) {
        return false;
      }

      bodyMap[MOVE] += 1;
      available = available - moveCost;

      return true;

    };

  }

  while (addBody()) {

  }
  Object.keys(bodyMap).forEach(key => {
    if (bodyMap[key] === 0) {
      delete bodyMap[key];
    }
  })

  console.log('available', available, 'bodyMap', JSON.stringify(bodyMap));
  return createBodyWithMap(bodyMap);

}




const freeEnergy = 300;
export default {
  run() {

    Object.keys(Game.spawns).forEach((key) => {
      const spawn = Game.spawns[key];

      if (spawn.spawning) {
        return;
      };
      // 低于300 就不考虑 了
      if (spawn.room.energyAvailable < freeEnergy) {
        return
      }
      const spawnQueue = new SpawnQueue(spawn.room);


      createCarry(spawnQueue);

      createHarvester(spawnQueue);

      createWorker(spawnQueue);

      if (spawnQueue.length > 0) {

        const roleName = spawnQueue.first();

        const creepIndex = Memory.rooms[spawn.room.name].creepIndex;
        const name = `${roleName}-${Game.time.toString(16)}`;
        const opt = {

          memory: { role: roleName, creepIndex: creepIndex, task: null },
          directions: [BOTTOM, LEFT, RIGHT, BOTTOM_RIGHT],
        };

        const body = createBody(roleName, spawn)

        const res = spawn.spawnCreep(body, name, opt);

        if (res === OK) {
          spawnQueue.shift();
          Memory.rooms[spawn.room.name].creepIndex++;
          log(`spawn ${roleName} ok`, name);
        } else {
          log('spawnCreep error', res)
        }
      }

    })

    if (Game.time % 400 === 0) {
      deleteCreepMemory();
    }

    return;


    if (Game.time % 400 === 0) {
      deleteCreepMemory();
    }
  },
};
