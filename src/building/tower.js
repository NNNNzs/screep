// var tower = Game.getObjectById('');

const towerList = Memory.towerList.map(id => Game.getObjectById(id))
export default {
  run() {
    if (towerList) {
      // 攻击
      const closestHostile = towerList[0].pos.findClosestByRange(FIND_HOSTILE_CREEPS);
      // const closestHostile = Memory.closestHostile;
      // 攻击
      if (closestHostile) {
        // Game.notify(`敌人出现在你的房间${Game.time}`)
        // console.log(`敌人出现在你的房间${Game.time}`)
        towerList.forEach(t => t.attack(closestHostile))
      }
      const toFixedList = Memory.toFixedStructures;

      if (toFixedList.length > 5) {
        const first = toFixedList[1];
        towerList[0].repair(first)
      }
    }
  }
}