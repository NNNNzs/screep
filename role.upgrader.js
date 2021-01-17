const showDash = { visualizePathStyle: { stroke: '#fffff' } }
const { findResourceStructure } = require('tools');
const rank = [STRUCTURE_CONTAINER, STRUCTURE_EXTENSION, STRUCTURE_SPAWN];
const upgrader = {
    run: function (creep) {
        // 如果正在升级，且携带的资源没有了
        if (creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
            // creep.signController(creep.room.controller,'我曾经翻过山和大海，也穿过人山人海。')
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
                creep.moveTo(creep.room.controller, showDash);
            }
        }
        else {
            const target = Game.getObjectById('60011aef4171757e7314246d');
            if(target.store.getUsedCapacity()>0){
                creep.self_withdraw(target)
            }else{
                upgrader.getResourceByStructure(creep)
            }
        }
    },
    // 从建筑物里面获取资源
    getResourceByStructure(creep) {
        const sources = findResourceStructure(creep, rank);
        // console.log()
        if (creep.withdraw(sources[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(sources[0], showDash);
        }
    }
};

module.exports = upgrader;