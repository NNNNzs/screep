export type BodyCreateMap = {
  [key in BodyPartConstant]?: number
}


export function log(first: string, ...args) {
  if (first === 'module/structure/buildExtensions') {
    console.log(first, args)
  }
}

/** 
 *
 * @param {RoomPosition} pos  
 * @param {AnyStructure['id'][]} sortList  
 * @description 根据距离排序 
 * 
*/
export const sortByRange = (pos: RoomPosition, sortList: RoomObject[] = []) => {

  sortList.sort((a, b) => {
    const adistance = a.pos.getRangeTo(pos)
    const bdistance = b.pos.getRangeTo(pos)
    // 返回距离最近的
    return adistance - bdistance
  });
}

type SortByUsedCapacityOptions = {
  orderBy: 'asc' | 'desc',
  resource?: ResourceConstant
}
/** 
 * @param {AnyStoreStructure[]} list 
 * @param {orderBy: 'asc' | 'desc', resource: ResourceConstant} options asc 从小到大，desc 从大到小
 * @description 根据剩余容量排序
*/
export const sortByUsedCapacity = (list: AnyStoreStructure[], {
  orderBy = 'asc',
  resource
}: SortByUsedCapacityOptions = { orderBy: 'asc' }) => {
  list.sort((a, b) => {
    return orderBy === 'asc' ? a.store.getUsedCapacity(resource) - b.store.getUsedCapacity(resource) : b.store.getUsedCapacity(resource) - a.store.getUsedCapacity(resource);
  })
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


/**
 * 
 * @param {Function} fun 传入函数
 */
export const useCpu = (fun: () => any, name: string) => {
  const startCpu = Game.cpu.getUsed();
  const res = fun();
  const functionName = name || fun.name;
  const elapsed = Game.cpu.getUsed() - startCpu;
  log('utils/useCpu', functionName, 'cost', elapsed)
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
};

export const addTickTask = (fun: () => any, timeout: number) => {
  if (!global.afterTickTask) {
    global.afterTickTask = []
  }
  const currentTick = Game.time;

  global.afterTickTask.push({ tick: currentTick + timeout, fun, });
  global.afterTickTask.sort((a, b) => a.tick - b.tick)
};

/**
 * 运行已经到期的任务
 * @deprecated
 */
export const runAfterTickTask = () => {

  if (!global.afterTickTask) {
    global.afterTickTask = []
  }

  const currentTickTasks = global.afterTickTask.filter(task => task.tick >= Game.time);

  if (currentTickTasks.length === 0) {
    return
  };

  currentTickTasks.forEach((task) => {
    // task.fun();
  });

  global.afterTickTask = global.afterTickTask.filter(task => task.tick > Game.time);
}

/** */