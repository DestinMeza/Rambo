const Task = require("./task");
const CreepBuilder = require("./creepBuilder");

const PROCESS = {
    RUNNING: 0,
    FAILURE: 1,
    SUCCESS: 2
};

const HARVESTER_STATE =
{
    IDLE: 0,
    HARVESTING: 1,
    DEPOSITING: 2
}

function process (self) {
    const creepName = "Harvester " +  self.randomNumber;
    const spawn = Game.getObjectById(self.spawnId);

    const body = CreepBuilder.getCreepBody([WORK, MOVE, CARRY], [MOVE, CARRY], spawn.room.name);

    let code = spawn.spawnCreep(body, creepName);
    
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

            if(Game.time - self.startTime < self.duration)
            {
                return PROCESS.RUNNING;
            }

            return PROCESS.FAILURE;
    }
}

module.exports = process;