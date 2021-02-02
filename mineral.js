// 特殊资源采集
const showDash = { visualizePathStyle: { stroke: '#ffaa00' } }
const resource = Game.getObjectById('5bbcb23f40062e4259e93814');
const stroage = Game.getObjectById('6003bf8942c7e2223662c971');
// 判断是否mineral是否有资源

const roleHarvester = {
    run: function (creep) {
        // resource.store
        // 剩余存储空间大于0
        if (creep.store.getFreeCapacity() > 0) {
            // 挖矿
            // console.log(creep.harvest(resource))
            if (creep.harvest(resource) === ERR_NOT_IN_RANGE) {
                creep.moveTo(resource)
            }
        }
        else {
            // 转移目标
            const targets = stroage
            if (creep.transfer(targets, RESOURCE_UTRIUM) == ERR_NOT_IN_RANGE) {
                creep.moveTo(targets, showDash);
            }
        }
    }
};
module.exports = roleHarvester;