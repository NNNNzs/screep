import { createBody, calcMove } from './utils';


/**
 *  @description 每个身体部件消耗的能量
 */
export const sourceMap = {
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

interface CreepItem {
  string: {
    sum: number,
    current: number,
    createBeforeDied: number,
  }
}

export const creepsList = {
  work: {
    sum: 1,
    current: 0,
    createBeforeDied: 10,
    body: createBody({
      [CARRY]: 4,
      [WORK]: 4,
      [MOVE]: 5,
      [HEAL]: 2,
    })
  },
  harvester: {
    sum: 2,
    current: 0,
    createBeforeDied: 20,
    body: createBody({
      [MOVE]: 8,
      [WORK]: 9,
    })
  },
  carry: {
    sum: 2,
    current: 0,
    createBeforeDied: 20,
    body: createBody({
      [CARRY]: 18,
      [MOVE]: 17
    })
  },

  builder: {
    sum: 1,
    current: 0,
    createBeforeDied: 10,
    body: createBody({
      [CARRY]: 12,
      [WORK]: 12,
      [MOVE]: 24,
    }),
    creepShouldCreate(alivedNum: number) {
      // 场上待建造的建筑大于0，且场上没有，则创建
      const length = Memory.toConstructionSite.length;
      const max = creepsList.builder.sum;
      if (alivedNum < max && length > 0) {
        return true
      }
      return false;
    }
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
  soldier: {
    sum: 0,
    current: 0,
    body: createBody({
      [TOUGH]: 2,
      [RANGED_ATTACK]: 11,
      [HEAL]: 9,
      [MOVE]: 24,
    })
  },
  doctor: {
    sum: 0,
    current: 0,
    body: createBody({
      [HEAL]: 5,
      [MOVE]: 5,
    })
  },
  repair: {
    index: 4,
    sum: 1,
    current: 0,
    body: createBody({
      [CARRY]: 9,
      [WORK]: 10,
      [MOVE]: 20
    })
  }
}

