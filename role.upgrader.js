const showDash = { visualizePathStyle: { stroke: '#fffff' } }

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
                creep.moveTo(creep.room.controller, showDash);
            }
        }
        else {
            // const target = Game.getObjectById('6003bf8942c7e2223662c971');
            // if(creep.isStructureEmpty([STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_CONTAINER,STRUCTURE_STORAGE])){
            //     creep.self_harvest()
            // }else{
            // }
            // creep.getResourceByStructure()
            // if(target.getUsedCapacity()>0){
                // creep.self_withdraw()
            // }else{
                creep.getResourceByStructure()
            // }
            // if (creep.self_harvest(1) === ERR_NOT_IN_RANGE) {
            //     creep.moveTo(resource,showDash)
            // }
        }
    },
};

module.exports = upgrader;