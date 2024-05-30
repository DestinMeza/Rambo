const Commander = require("./commander");
const CreepRunner = require("./creepRunner");
const WorldState = require("./worldState");
const BaseManager = require("./baseManager");

let worldState = null;
let commander = null;

module.exports.loop = function () {
    setBlueprintToRooms();
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

function setBlueprintToRooms()
{
    let baseManager = new BaseManager();

    const mainBase = getMainBase();

    for(const roomKey in Game.rooms)
    {
        const room = Game.rooms[roomKey];

        //Side rooms
        if(room.controller == undefined)
        {
            continue;
        }

        //Unowned rooms
        if(!room.controller.my)
        {
            continue;
        }

        if(room.memory.blueprint == undefined)
        {
            baseManager.assignBase(room.name, mainBase == roomKey);
        }
    }
}

function getMainBase()
{
    if(Memory.global == undefined)
    {
        let firstRoomFound = null;

        for(const roomKey in Game.rooms)
        {
            firstRoomFound = Game.rooms[roomKey];
            break;
        }

        Memory.global = {
            mainBase: firstRoomFound.name
        }
    }
    
    return Memory.global.mainBase;
}

function deleteNullCreeps()
{
    for(var i in Memory.creeps) {
        if(!Game.creeps[i]) {
            delete Memory.creeps[i];
        }
    }
}