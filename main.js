const Commander = require("./commander");
const CreepRunner = require("./creepRunner");

let commander = null;

module.exports.loop = function () {
    deleteNullCreeps();

    if(commander == null) {
        commander = new Commander({
            name: "Test Commander"
        });
    }
    else {
        commander.process();
    }

    CreepRunner.run();
}

function deleteNullCreeps()
{
    for(var i in Memory.creeps) {
        if(!Game.creeps[i]) {
            delete Memory.creeps[i];
        }
    }
}