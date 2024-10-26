
export const showDash = { visualizePathStyle: { stroke: "#fffff" } };
export enum ROLE_NAME_ENUM {
  /** 负责工作的工人 */
  worker = 'work',
  /** 负责运输资源的运输者 */
  carry = 'carry',
  /** 负责采集资源的采集者 */
  harvester = 'harvester',

  /** 探索者 */
  explorer = 'explorer',

  /** 士兵 */
  soldier = 'soldier',

  miner = 'miner',

  miner1 = 'miner1',
};

export enum Task {
  build = 'build',
  upgrade = 'upgrade',
  repair = 'repair',
  carry = 'carry',
  harvest = 'harvest',
  take = 'take',
}
export const FREE_ENERGY = 300;

/** creeps 身体构成数量比例 */
type BodyWeight = { body: BodyPartConstant, min?: number, max?: number, weight: number }



/** 创建身体部件的比例和最小值对象 */
type BodyRateMap = {
  [key in ROLE_NAME_ENUM]?: BodyWeight[];
};

export const bodyRateMap: BodyRateMap = {
  /** 普通工人 */
  [ROLE_NAME_ENUM.worker]: [
    { body: CARRY, min: 1, weight: 1, max: 10 },
    { body: WORK, min: 1, weight: 1, max: 10 },
  ],
  /** 专职采矿者 */
  [ROLE_NAME_ENUM.harvester]: [
    { body: WORK, min: 1, max: 5, weight: 1 },
  ],
  /** 专职搬运者 */
  [ROLE_NAME_ENUM.carry]: [
    { body: CARRY, min: 1, weight: 1, max: 20 },
  ],
  /** 探索者 */
  [ROLE_NAME_ENUM.explorer]: [
    { body: MOVE, max: 1, weight: 1 },
  ],
  /** 士兵 */
  [ROLE_NAME_ENUM.soldier]: [
    { body: MOVE, max: 1, weight: 1 },
    { body: ATTACK, max: 1, weight: 1 },
    { body: RANGED_ATTACK, max: 1, weight: 1 },
    { body: HEAL, max: 1, weight: 1 },
  ]
}