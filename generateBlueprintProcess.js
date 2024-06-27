const BaseManager = require("./baseManager");

const PROCESS = {
    RUNNING: 0,
    FAILURE: 1,
    SUCCESS: 2
};

function process (self) {

    const room = Game.rooms[self.room];

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

    const baseManager = new BaseManager();

    const mainBaseName = getMainBaseName();
    const isMainBase = mainBaseName == room.name;

    const result = baseManager.assignBase(room.name, isMainBase);


    return result ? PROCESS.SUCCESS : PROCESS.FAILURE;
}

function getMainBaseName()
{
    if(Memory.global == undefined)
    {
        Memory.global = {};   
    }

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