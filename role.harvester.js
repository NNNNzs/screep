
const { findEmptyStructure,findResourceTombstons } = require('tools')
// 采集者
const showDash = { visualizePathStyle: { stroke: '#ffaa00' } }
function findTarget(creep) {
    const rank = [STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_TOWER, STRUCTURE_CONTAINER];
    return findEmptyStructure(creep, rank);
}
const roleHarvester = {
    run: function (creep, index) {
        // findResourceTombstons(creep)
        // 剩余存储空间大于0
        if (creep.store.getFreeCapacity() > 0) {
            // 挖矿
            creep.self_harvest(index)
        }
        else {
            // 转移目标
            const targets = findTarget(creep)
            if (targets.length > 0) {
                if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], showDash);
                }
            }
        }
    },
    // 挖坑
    harvest(creep, index=0) {
        const sources = creep.room.find(FIND_SOURCES);
        if (creep.harvest(sources[index % 2]) == ERR_NOT_IN_RANGE) {
            creep.moveTo(sources[index % 2], showDash);
        }
    }
};
module.exports = roleHarvester;