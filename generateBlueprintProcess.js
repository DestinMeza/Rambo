const BaseManager = require("./baseManager");

const PROCESS = {
    RUNNING: 0,
    FAILURE: 1,
    SUCCESS: 2
};

function process (self) {

    const room = Game.rooms[self.roomName];

    if(room == undefined)
    {
        return PROCESS.FAILURE;
    }
    
    if(room.controller == undefined)
    {
        //Side rooms
        return PROCESS.FAILURE;
    }
    if(!room.controller.my)
    {
        //Unowned rooms
        return PROCESS.FAILURE;
    }

    if(room.memory.blueprint != undefined)
    {
        console.log("Room ", room, "has a blueprint assigned.");
        return PROCESS.FAILURE;
    }

    const baseManager = new BaseManager();

    if(baseManager.evaluateRoom(room.name) == undefined)
    {
        console.log("Room ", room, "is not a valid room to build a base in.");
        return PROCESS.FAILURE;
    }

    if(room.memory.grid)
    {
        const mainBaseName = getMainBaseName();
        baseManager.assignBase(room.name, mainBaseName == room.name);
    }
    else
    {
        console.log("Room ", room, "is to be ignored.");
        return PROCESS.FAILURE;
    }

    return PROCESS.SUCCESS;
}

function getMainBaseName()
{
    if(Memory.global.mainBase == undefined)
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

module.exports = process;