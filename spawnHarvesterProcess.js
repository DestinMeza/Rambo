const Task = require("./task");

const PROCESS = Object.freeze({
    RUNNING: 0,
    FAILURE: 1,
    SUCCESS: 2
});

const HARVESTER_STATE =
{
    IDLE: 0,
    HARVESTING: 1,
    DEPOSITING: 2
}

function process (self) {
    const creepName = "Harvester " +  self.data.randomNumber;
    const spawn = Game.getObjectById(self.data.spawnId);

    let code = spawn.spawnCreep([WORK, MOVE, CARRY], creepName);
    
    switch(code)
    {
        case OK: 
            Game.creeps[creepName].memory.task = new Task({
                name: "Harvest and Return",
                creep: creepName,
                data:
                {
                    state: HARVESTER_STATE.IDLE
                }
            })

            return PROCESS.SUCCESS;
        default:
            return PROCESS.FAILURE;
    }
}

module.exports = process;