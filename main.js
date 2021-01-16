const roleHarvester = require('role.harvester');
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
    for (var name in Game.creeps) {
        const creep = Game.creeps[name];
        const role = creep.memory.role;
        if (role == 'harvester') {
            i++;
            roleHarvester.run(creep, i);
        }
        else if (role == 'upgrader') {
            // i++
            // roleHarvester.run(creep,i);
            roleUpgrader.run(creep);
        }
        else if (role == 'builder') {
            roleBuilder.run(creep);
        }
        else if (role == 'onlyHarvester') {
            roleOnlyHarvester.run(creep)
        } else if (role == 'carry') {
            roleCarry.run(creep)
        } else if (role == 'repair') {
            roleRepair.run(creep)
        }
    }
}