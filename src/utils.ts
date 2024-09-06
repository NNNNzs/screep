export type BodyCreateMap = {
  [key in BodyPartConstant]?: number
}

export const log = (...args) => {
  console.log(...args)
}
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


// 寻找可以取出来能量的建筑
// todo 能量降序
export const findResourceStructure = (creep, rank) => {
  for (let i in rank) {
    const structure = rank[i]
    let sources = creep.room.find(FIND_STRUCTURES, {
      filter: (s) => { return (s.structureType == structure && s.store.getUsedCapacity(RESOURCE_ENERGY) > 0) }
    });
    if (sources.length > 0) {
      sources.sort((a, b) => b.store.getUsedCapacity() - a.store.getUsedCapacity())
      return sources;
    } else {
      continue;
    }
  }
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

/** 每多少tick运行一次 */
export const runPerTime = (fun: () => any, everyTick: number) => {
  if (Game.time % everyTick === 0) {
    return fun()
  }
}

export const runAfterStart = (cb: () => any, delayTick: number) => {
  if (Game.time === Memory.startTick + delayTick) {
    return cb();
  }
}


/** */