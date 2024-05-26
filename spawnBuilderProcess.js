const Task = require("./task");
const CreepBuilder = require("./creepBuilder");

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
    const creepName = "Builder " +  self.randomNumber;
    const spawn = Game.getObjectById(self.spawnId);

    const body = CreepBuilder.getCreepBody([WORK, MOVE, CARRY], [WORK, MOVE, CARRY], spawn.room.name);

    let code = spawn.spawnCreep(body, creepName);

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

            if(Game.time - self.startTime < self.duration)
            {
                return PROCESS.RUNNING;
            }

            return PROCESS.FAILURE;
    }
}

module.exports = process;