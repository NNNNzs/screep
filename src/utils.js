/**
 * 
 * @param {Object} data 
 * @description 根据一个对象，返回生成的body
 * @returns {Array}
 */
export const createBody = (data = {}) => {
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
export const calcMove = (bodys) => {
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
 * @param {*} structureList 
 * @description 找到第一个空的
 * @returns 
 */
export const findFirstEmptyStruct = (creep, structureList = []) => {
  for (let i in structureList) {
    const structureType = structureList[i];
    const target = creep.room.find(FIND_STRUCTURES, {
      filter: (s) => {
        return (s.structureType === structureType && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
      }
    });

    if (target.length > 0) {
      return target
    } else {
      continue;
    }
  }
}


export const findClosestByRange = (creep, type) => {
  return creep.pos.findClosestByRange(type);
}

