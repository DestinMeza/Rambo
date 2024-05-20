const Task = require("./task");

const PROCESS = {
    RUNNING: 0,
    FAILURE: 1,
    SUCCESS: 2
};

const UPGRADER_STATE =
{
    IDLE: 0,
    COLLECTING_STORE: 1,
    HARVESTING: 2,
    UPGRADING: 3
}

function process (self) {
    const creepName = "Upgrader " +  self.data.randomNumber;
    const spawn = Game.getObjectById(self.data.spawnId);

    let code = spawn.spawnCreep([WORK, MOVE, CARRY], creepName);
    
    switch(code)
    {
        case OK: 
            Game.creeps[creepName].memory.task = new Task({
                name: "Upgrade",
                creep: creepName,
                data:
                {
                    state: UPGRADER_STATE.IDLE,
                    roomController: spawn.room.controller.id
                }
            })

            return PROCESS.SUCCESS;
        default:
            return PROCESS.FAILURE;
    }
}

module.exports = process;