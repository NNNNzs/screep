const sourceMap = {
  MOVE: { cost: 50 },
  WORK: { cost: 100 },
  CARRY: { cost: 50 },
  ATTACK: { cost: 80 },
  RANGED_ATTACK: { cost: 150 },
  HEAL: { cost: 250 },
  CLAIM: { cost: 600 },
  TOUGH: { cost: 10 },
};

// 给定的部件占比
const ratio = {
  WORK: 0.5,
  CARRY: 0.5,
  // 可以根据需要添加其他部件的占比
};

// 给定的总能源
const totalEnergy = 1000; // 例如1000

// 计算部件数量的最大值
function calculateMaxComponents(energy, cost) {
  return Math.floor(energy / cost);
}

// 检查是否满足所有部件的占比条件
function isValidRatio(components, total, ratio) {
  for (const key in ratio) {
    if (components[key] !== ratio[key] * total) {
      return false;
    }
  }
  return true;
}

// 穷举搜索最大可满足的部件配比
function findMaxComponents(sourceMap, ratio, totalEnergy) {
  let bestComponents = {};
  let bestTotal = 0;

  const keys = Object.keys(sourceMap);
  const moveCost = sourceMap.MOVE.cost;

  // 穷举MOVE部件的数量
  for (let move = 1; move <= calculateMaxComponents(totalEnergy, moveCost); move++) {
    let remainingEnergy = totalEnergy - moveCost * move;
    let components = { MOVE: move };

    // 尝试分配剩余部件
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (key === 'MOVE') continue; // 跳过MOVE，因为它已经分配了

      const maxCount = calculateMaxComponents(remainingEnergy, sourceMap[key].cost);
      components[key] = Math.floor(ratio[key] * move); // 根据比例分配
      remainingEnergy -= sourceMap[key].cost * components[key];

      // 检查是否满足所有部件的占比条件
      if (!isValidRatio(components, move, ratio)) {
        break;
      }
    }

    // 检查是否满足总能源限制
    if (remainingEnergy >= 0 && isValidRatio(components, move, ratio)) {
      const total = Object.values(components).reduce((acc, val) => acc + val, 0);
      if (total > bestTotal) {
        bestTotal = total;
        bestComponents = components;
      }
    }
  }

  return bestComponents;
}

// 调用函数并打印结果
const maxComponents = findMaxComponents(sourceMap, ratio, totalEnergy);
console.log(maxComponents);