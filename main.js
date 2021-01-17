const roleUpgrader = require('role.upgrader');
const roleBuilder = require('role.builder');
const roleCarry = require('role.carry');
const roleOnlyHarvester = require('role.onlyHarvester')
const roleRepair = require('role.repair')
const autoCreate = require('auto.create')


require('mount')()
// console.log(JSON.stringify(mount))

module.exports.loop = function () {
    // const t = Game.time;
    autoCreate.run();
    let i = 0;
    let work = 0;
    let carry = 0;
    for (var name in Game.creeps) {
        const creep = Game.creeps[name];
        const role = creep.memory.role;
        if (role == 'carry') {
            roleCarry.run(creep, carry)
            carry++
        }
        else if (role == 'harvester') {
            roleOnlyHarvester.run(creep, work)
            work++
        }
        else if (role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        else if (role == 'builder') {
            roleBuilder.run(creep);
        }
        else if (role == 'repair') {
            roleRepair.run(creep)
        }
    }
}