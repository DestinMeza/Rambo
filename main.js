const Commander = require("./commander");
const CreepRunner = require("./creepRunner");
const WorldState = require("./worldState");

let worldState = null;
let commander = null;

module.exports.loop = function () {
    deleteNullCreeps();

    if(commander == null || worldState == null) {
        worldState = new WorldState();

        commander = new Commander({
            name: "Test Commander",
            worldState: worldState
        });
    }
    else {
        worldState.process();
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