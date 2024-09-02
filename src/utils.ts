/**
 * 
 * @param {Object} data 
 * @description 根据一个对象，返回生成的body
 * @returns {Array}
 */
export const createBody = (data = {}): BodyPartConstant[] => {
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

/**
 * 
 * @param {Array} bodys 
 * @description 计算移动力，返回值表示满载的情况下多少tick移动一个格子
 * @returns {Number} 满载情况下 n tick移动一个格子
 */
export const calcMove = (bodys: BodyPartConstant[]): number => {
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

export const getAllSource = (creep, store) => {

}

export const sendAllSrouce = (creep, store) => {

}


/**
 * 
 * @param {*} creep 
 * @param {array} structureList 
 * @description 找到第一个能量未满的建筑
 * @returns 
 */
export const findFirstEmptyStruct = (creep: Creep, structureList: BuildableStructureConstant[] = []) => {

  // for (let i in structureList) {
  //   const structureType = structureList[i];

  //   const target = creep.room.find(FIND_MY_STRUCTURES, {
  //     filter: (s) => {

  //       const hasStore = s.structureType;

  //       return (s.structureType === structureType && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
  //     }
  //   });

  //   if (target.length > 0) {
  //     return target
  //   } else {
  //     continue;
  //   }
  // }
}
// findFirstEmptyStruct(creep,[STRUCTURE_STORAGE, STRUCTURE_CONTAINER])


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

export const findEmptyStructure = (creep: Creep, rank: StructureConstant[]) => {
  // for (let i in rank) {
  //   const structure = rank[i]
  //   let sources = creep.room.find(FIND_STRUCTURES, {
  //     filter: (s) => {
  //       return (s.structureType === structure && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
  //     }
  //   });

  //   if (sources.length > 0) {
  //     sources.sort((a, b) => a.store.getFreeCapacity() - b.store.getFreeCapacity())
  //     return sources;
  //   } else {
  //     continue;
  //   }
  // }
}


/**
 * 
 * @param {Function} fun 传入函数
 */
export const useCpu = (fun: () => any, name: string) => {
  const startCpu = Game.cpu.getUsed();
  const res = fun();
  const functionName = name || fun.name;
  const elapsed = Game.cpu.getUsed() - startCpu;
  console.log(functionName, 'cost', elapsed)
  return res;
}

export const runPerTime = (fun: () => any, everyTick: number) => {
  if (Game.time % everyTick === 0) {
    return fun()
  }
}

export const runAfterStart = (cb: () => any) => {
  if (Game.time === 0) {
    return cb();
  }
}


/** */