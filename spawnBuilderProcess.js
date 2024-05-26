const Task = require("./task");

const PROCESS = {
    RUNNING: 0,
    FAILURE: 1,
    SUCCESS: 2
};

const BUILDER_STATE =
{
    IDLE: 0,
    COLLECTING_STORE: 1,
    HARVESTING: 2,
    BUILDING: 3
}

function process (self) {
    const creepName = "Builder " +  self.data.randomNumber;
    const spawn = Game.getObjectById(self.data.spawnId);

    let code = spawn.spawnCreep([WORK, MOVE, CARRY], creepName);
    
    switch(code)
    {
        case OK: 
            Game.creeps[creepName].memory.task = new Task({
                name: "Build Local",
                creep: creepName,
                data:
                {
                    state: BUILDER_STATE.IDLE,
                    roomController: spawn.room.controller.id
                }
            })

            return PROCESS.SUCCESS;
        default:
            return PROCESS.FAILURE;
    }
}

module.exports = process;