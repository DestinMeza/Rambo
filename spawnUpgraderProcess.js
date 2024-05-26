const Task = require("./task");
const CreepBuilder = require("./creepBuilder");

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
    const creepName = "Upgrader " +  self.randomNumber;
    const spawn = Game.getObjectById(self.spawnId);

    const body = CreepBuilder.getCreepBody([WORK, MOVE, CARRY], [MOVE, CARRY], spawn.room.name);

    let code = spawn.spawnCreep(body, creepName);
    
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

            if(Game.time - self.startTime < self.duration)
            {
                return PROCESS.RUNNING;
            }

            return PROCESS.FAILURE;
    }
}

module.exports = process;