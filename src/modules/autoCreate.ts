import { BodyCreateMap, calcMove, createBodyWithMap, deleteCreepMemory } from "../utils";
import { ROLE_NAME_ENUM, WORK_NAME, bodyCostMap, bodyRateMap, creepsList, defaultCreep } from "../var";

export class SpawnQueue {
  _spanQueue: ROLE_NAME_ENUM[];

  public room: Room
  constructor(room: Room) {
    this.room = room
    this._spanQueue = Memory.rooms[room.name].spawnQueue || [];
  }

  push(roleName: ROLE_NAME_ENUM) {
    // 队列里没有才加
    if (this._spanQueue.indexOf(roleName) === -1) {
      this._spanQueue.push(roleName);
    }
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

const createWorker = (spawnQueue: SpawnQueue) => {
  const totalScreep = Object.keys(Game.creeps);
  // 全局为空
  if (totalScreep.length === 0) {
    spawnQueue.push(WORK_NAME);
  }

  // 小于设定值
  const workers = totalScreep.filter(creepName => {
    const creep = Game.creeps[creepName];
    return creep.memory.role === WORK_NAME;
  });

  if (workers.length < spawnQueue.room.memory.maxWorker) {
    spawnQueue.push(WORK_NAME);
  }
}

export const createBody = (roleName: ROLE_NAME_ENUM, spawn: StructureSpawn) => {
  // 动态规划，根据角色选择body按照一定配比
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



/** */
export const getCost = (bodys) => {
  let sum = 0;
  _.forEach(bodys, (part) => {
    sum += bodyCostMap[part].cost;
  });
  const room = Game.spawns["Spawn1"].room;
  const str = `${room.energyAvailable}/${room.energyCapacityAvailable
    }but ${sum} ${calcMove(bodys)}tick/move`;
  if (room.energyAvailable < room.energyCapacityAvailable / 2) {
    Game.notify("能量低于一半，注意上线查看" + str);
  }
  return sum;
};



function autoCreate(creepName, spawns = "Spawn1") {
  // 拷贝一份
  let creepsMap = _.cloneDeep(creepsList);
  const body = creepsMap[creepName].body;
  const code = Game.spawns[spawns].spawnCreep(
    body,
    `${creepName}-${Game.time.toString(16)}`,
    {
      memory: { role: creepName },
      directions: [BOTTOM, LEFT, RIGHT, BOTTOM_RIGHT],
    }
  );
  const room = Game.spawns[spawns].room;
  // 能量不够
  if (code == -6) {
    const cost = getCost(body);
    const str = `create ${creepName} fail ${room.energyAvailable}/${room.energyCapacityAvailable}but ${cost}`;
    console.log(str);
  }
  deleteCreepMemory();
}

const freeEnergy = 300;
export default {
  run() {

    Object.keys(Game.spawns).forEach((key) => {
      const spawn = Game.spawns[key];

      if (spawn.spawning) {
        return;
      };
      const spawnQueue = new SpawnQueue(spawn.room);

      createWorker(spawnQueue);

      if (spawnQueue.length > 0) {

        const roleName = spawnQueue.first();

        const creepIndex = Memory.rooms[spawn.room.name].creepIndex;
        const name = `${roleName}-${Game.time.toString(16)}`;
        const opt = {
          memory: { role: roleName, creepIndex: creepIndex },
          directions: [BOTTOM, LEFT, RIGHT, BOTTOM_RIGHT],
        };

        const res = spawn.spawnCreep(createBody(roleName, spawn), name, opt);

        if (res === OK) {
          spawnQueue.shift();
          Memory.rooms[spawn.room.name].creepIndex++;
        } else {
          console.log('spawnCreep error', res)
        }
      }

    })

    if (Game.time % 400 === 0) {
      deleteCreepMemory();
    }

    return;

    let currentCreep = _.cloneDeep(creepsList);
    // 计算当前场上 有多少个creep
    _.forEach(Game.creeps, (creep) => {
      const role = creep.memory.role;
      const costTime = creep.memory;

      if (currentCreep[role]) {
        currentCreep[role].current++;
      }

      // 场上的creep计数
    });

    Object.keys(creepsList).some((creepName) => {
      const role = currentCreep[creepName];

      // 死亡创建，阻塞创建
      if (role.sum > role.current) {
        autoCreate(creepName);
        return true;
      } else {
        return false;
      }
    });

    if (Game.time % 400 === 0) {
      deleteCreepMemory();
    }
  },
};
