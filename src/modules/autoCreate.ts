import { calcMove, deleteCreepMemory } from "../utils";
import { sourceMap, creepsList, defaultCreep } from "../var";
import { findSpawns } from "./Scanner";

/** */
export const getCost = (bodys) => {
  let sum = 0;
  _.forEach(bodys, (part) => {
    sum += sourceMap[part].cost;
  });
  const room = Game.spawns["Spawn1"].room;
  const str = `${room.energyAvailable}/${room.energyCapacityAvailable
    }but ${sum} ${calcMove(bodys)}tick/move`;
  if (room.energyAvailable < room.energyCapacityAvailable / 2) {
    Game.notify("能量低于一半，注意上线查看" + str);
  }
  return sum;
};

function createDefaultWorker(spawn: StructureSpawn) {
  if (spawn.room.energyCapacityAvailable === freeEnergy) {
    const currentWorkLength = Object.keys(Game.creeps).filter(name => Game.creeps[name].memory.role === 'work').length;
    const maxWorkLength = Memory.rooms[spawn.room.name].maxWorker;

    if (currentWorkLength >= maxWorkLength) {
      return
    }
    if (!spawn.room.memory.spawnQueue.includes('work')) {
      spawn.room.memory.spawnQueue.push('work')
    }
  }
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

      Memory.rooms[spawn.room.name].spawnQueue.forEach((role) => {

        // 根据当前剩余能量和角色获取最大身体部件

        spawn.spawnCreep(defaultCreep.body,
          `${role}-${Game.time.toString(16)}`,
          {
            memory: { role: role, },
            directions: [BOTTOM, LEFT, RIGHT, BOTTOM_RIGHT],
          })

      });

      createDefaultWorker(spawn);


    })

    if (Game.time % 400 === 0) {
      deleteCreepMemory();
    }

    return;

    let currentCreep = _.cloneDeep(creepsList);
    // 计算当前场上 有多少个creep
    _.forEach(Game.creeps, (creep) => {
      const role = creep.memory.role;
      const costTime = creep.memory.costTime;

      if (currentCreep[role]) {
        currentCreep[role].current++;
      }

      // 如果有一个快死了，那么这个tick就立即创建
      if (costTime && costTime >= creep.ticksToLive) {
        creep.say("我快死了");
        autoCreate(role);
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
