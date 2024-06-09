const WorldState = require("./worldState");
const Commander = require("./commander");
const CreepRunner = require("./creepRunner");

let commander = null;
let worldState = null;

module.exports.loop = function () {

    //Clears out creep memory when they pass.
    deleteNullCreeps();

    if(worldState == null || commander == null) {
        worldState = new WorldState();
        commander = new Commander(worldState);
        return;
    }

    //World State updates condition data.
    worldState.process();

    //Creeps run their tasks.
    CreepRunner.run();

    //Commander processes and looks for plans to execute.
    commander.process();
}

function deleteNullCreeps()
{
    for(var i in Memory.creeps) {
        if(!Game.creeps[i]) {
            delete Memory.creeps[i];
        }
    }
}