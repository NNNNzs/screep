import { createBodyWithMap, calcMove } from "./utils";

export const showDash = { visualizePathStyle: { stroke: "#fffff" } };
export enum ROLE_NAME_ENUM {
  worker = 'work',
  carry = 'carry',
  harvester = 'harvester',
  upgrader = 'upgrader',
  builder = 'builder',
  miner = 'miner',
  miner1 = 'miner1',
};

/** creeps 身体构成数量比例 */
type BodyWeight = { body: BodyPartConstant, min?: number, max?: number, weight: number }


export const WORK_NAME = ROLE_NAME_ENUM.worker;
export const CARRY_NAME = ROLE_NAME_ENUM.carry;
export const HARVESTER_NAME = ROLE_NAME_ENUM.harvester;

/**
 *  @description 每个身体部件消耗的能量
 */
export const bodyCostMap = {
  [MOVE]: { cost: 50, },
  [WORK]: { cost: 100, },
  [CARRY]: { cost: 50, },
  [ATTACK]: { cost: 80, },
  [RANGED_ATTACK]: { cost: 150, },
  [HEAL]: { cost: 250, },
  [CLAIM]: { cost: 600, },
  [TOUGH]: { cost: 10, },
};

/** 创建身体部件的比例和最小值对象 */
type BodyRateMap = {
  [key in ROLE_NAME_ENUM]?: BodyWeight[];
};

export const bodyRateMap: BodyRateMap = {
  [ROLE_NAME_ENUM.worker]: [
    { body: CARRY, min: 1, weight: 1 },
    { body: WORK, min: 1, weight: 1 },
  ],
  [ROLE_NAME_ENUM.harvester]: [
    { body: WORK, min: 1, max: 3, weight: 1 },
  ],
  [ROLE_NAME_ENUM.carry]: [
    { body: CARRY, min: 1, weight: 1 },
  ]
}

interface CreepItem {
  index?: number;
  sum: number;
  current?: number;
  body: BodyPartConstant[];
  createBeforeDied?: number;
}

// 菜鸟爬虫
export const defaultCreep: CreepItem = {
  sum: 2,
  body: createBodyWithMap({
    [MOVE]: 2,
    [WORK]: 1,
    [CARRY]: 1,
  })
}

export const creepsList: Record<string, CreepItem> = {
  harvester: {
    sum: 2,
    current: 0,
    createBeforeDied: 20,
    body: createBodyWithMap({
      [MOVE]: 8,
      [WORK]: 9,
    }),
  },
  carry: {
    sum: 2,
    current: 0,
    createBeforeDied: 20,
    body: createBodyWithMap({
      [CARRY]: 18,
      [MOVE]: 17,
    }),
  },
  builder: {
    sum: 1,
    current: 0,
    createBeforeDied: 10,
    body: createBodyWithMap({
      [CARRY]: 12,
      [WORK]: 12,
      [MOVE]: 24,
    }),
  },
  work: {
    sum: 1,
    current: 0,
    createBeforeDied: 10,
    body: createBodyWithMap({
      [CARRY]: 4,
      [WORK]: 4,
      [MOVE]: 5,
      [HEAL]: 2,
    }),
  },
  soldier: {
    sum: 0,
    current: 0,
    body: createBodyWithMap({
      [TOUGH]: 2,
      [RANGED_ATTACK]: 11,
      [HEAL]: 9,
      [MOVE]: 24,
    }),
  },
  doctor: {
    sum: 0,
    current: 0,
    body: createBodyWithMap({
      [HEAL]: 5,
      [MOVE]: 5,
    }),
  },
  repair: {
    index: 4,
    sum: 1,
    current: 0,
    body: createBodyWithMap({
      [CARRY]: 9,
      [WORK]: 10,
      [MOVE]: 20,
    }),
  },
};
