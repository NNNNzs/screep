import { createBodyWithMap } from "./utils";

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
export const FREE_ENERGY = 300;

/** creeps 身体构成数量比例 */
type BodyWeight = { body: BodyPartConstant, min?: number, max?: number, weight: number }



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

