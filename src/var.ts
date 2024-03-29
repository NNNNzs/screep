import { createBody, calcMove } from "./utils";

export const showDash = { visualizePathStyle: { stroke: "#fffff" } };

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
    cost: 80,
  },
  [RANGED_ATTACK]: {
    cost: 150,
  },
  [HEAL]: {
    cost: 250,
  },
  [CLAIM]: {
    cost: 600,
  },
  [TOUGH]: {
    cost: 10,
  },
};

interface CreepItem {
  index?: number;
  sum: number;
  current: number;
  body: BodyPartConstant[];
  createBeforeDied?: number;
}

export const creepsList: Record<string, CreepItem> = {
  harvester: {
    sum: 2,
    current: 0,
    createBeforeDied: 20,
    body: createBody({
      [MOVE]: 8,
      [WORK]: 9,
    }),
  },
  carry: {
    sum: 2,
    current: 0,
    createBeforeDied: 20,
    body: createBody({
      [CARRY]: 18,
      [MOVE]: 17,
    }),
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
  },
  work: {
    sum: 1,
    current: 0,
    createBeforeDied: 10,
    body: createBody({
      [CARRY]: 4,
      [WORK]: 4,
      [MOVE]: 5,
      [HEAL]: 2,
    }),
  },
  soldier: {
    sum: 0,
    current: 0,
    body: createBody({
      [TOUGH]: 2,
      [RANGED_ATTACK]: 11,
      [HEAL]: 9,
      [MOVE]: 24,
    }),
  },
  doctor: {
    sum: 0,
    current: 0,
    body: createBody({
      [HEAL]: 5,
      [MOVE]: 5,
    }),
  },
  repair: {
    index: 4,
    sum: 1,
    current: 0,
    body: createBody({
      [CARRY]: 9,
      [WORK]: 10,
      [MOVE]: 20,
    }),
  },
};
