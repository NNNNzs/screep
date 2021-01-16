// const { findResourceStructure, findEmptyStructure } = require('tools')
const pointes = [
  { source: '5bbcabec9099fc012e634838', container: '6001be72ddc08054e4138598' },
  { source: '5bbcabec9099fc012e634837', container: '60023bf0cf2cfd35125f818a' }
]
const roleCarry = {
  run: function (creep, index = 0) {
    // 只从两个固定
    if (creep.store.getFreeCapacity() > 0) {
      const sources = Game.getObjectById(pointes[index%2].container)
      if (creep.withdraw(sources, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(sources);
      }
    } else {
      creep.sendRourceToStructure()
    }
  },
};

module.exports = roleCarry;