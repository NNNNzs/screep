// const roleUpgrader = require('role.upgrader')
import roleUpgrader from './upgrader'
const roleBuilder = {
    toBuildStructure(creep:Creep) {
        return creep.room.find(FIND_CONSTRUCTION_SITES);
    },
    build(creep) {
        // 待建造的工地
        const targets = roleBuilder.toBuildStructure(creep);
        // 如果有带建造的
        if (targets.length) {
            if (creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffffff' } });
            }
        }
    },
    run: function (creep) {
        // 如果没有待建设的建筑，执行升级
        if (!roleBuilder.toBuildStructure(creep).length) {
            roleUpgrader.run(creep);
            return;
        }
        if (creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.building = false;
            // 开始挖矿
            creep.say('🔄 harvest');
        }
        if (!creep.memory.building && creep.store.getFreeCapacity() == 0) {
            creep.memory.building = true;
            // 开始建造
            creep.say('🚧 build');
        }
        // 如果正在建造
        if (creep.memory.building) {
            roleBuilder.build(creep)
        }
        else {
            try {
                creep.getResourceByStructure();
            }
            catch (e) {
                // console.log(e)
                creep.self_harvest(1)
            }
        }
    }
};

export default roleBuilder;