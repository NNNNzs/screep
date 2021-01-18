const showDash = { visualizePathStyle: { stroke: '#fffff' } }
const { findResourceStructure } = require('tools');
const rank = [STRUCTURE_CONTAINER, STRUCTURE_EXTENSION, STRUCTURE_SPAWN];
const upgrader = {
    run: function (creep) {
        // 如果正在升级，且携带的资源没有了
        if (creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.upgrading = false;
            creep.say('🔄 harvest');
        }
        // 如果不在升级，且剩余存储空间为0
        if (!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
            creep.memory.upgrading = true;
            creep.say('⚡ upgrade');
        }

        if (creep.memory.upgrading) {
            if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
            // 
                creep.moveTo(creep.room.controller, showDash);
            }
        }
        else {
            const target = Game.getObjectById('6003bf8942c7e2223662c971');
            if(target.store.getUsedCapacity()>0){
                creep.self_withdraw(target)
            }else{
                creep.getResourceByStructure()
            }
        }
    },
};

module.exports = upgrader;