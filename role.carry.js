// const { findResourceStructure, findEmptyStructure } = require('tools')

const roleCarry = {
  run: function (creep) {
    // 可以拿资源
    if (creep.store.getFreeCapacity() > 0) {
      creep.getResourceByStructure([STRUCTURE_CONTAINER])
    } else {
      creep.sendRourceToStructure()
    }
  },
};

module.exports = roleCarry;