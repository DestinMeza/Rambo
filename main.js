const Commander = require("./commander");
const CreepRunner = require("./creepRunner");
const WorldState = require("./worldState");
const BaseManager = require("./baseManager");

let worldState = null;
let commander = null;
let baseManager = null;

module.exports.loop = function () {

    deleteNullCreeps();

    if(commander == null || worldState == null) {
        worldState = new WorldState();
        baseManager = new BaseManager();

        commander = new Commander({
            name: "Test Commander",
            worldState: worldState
        });

        baseManager.assignBase("sim", true);
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