const Task = require("./task");
const CreepBuilder = require("./creepBuilder");

const PROCESS = {
    RUNNING: 0,
    FAILURE: 1,
    SUCCESS: 2
};

const TRANSPORTER_STATE =
{
    IDLE: 0,
    WITHDRAWING: 1,
    DEPOSITING: 2,
}

function process (self) {
    const creepName = "Transporter " +  self.randomNumber;
    const spawn = Game.getObjectById(self.spawnId);

    const body = CreepBuilder.getCreepBody([MOVE, CARRY], [MOVE, CARRY], spawn.room.name);

    let code = spawn.spawnCreep(body, creepName);
    
    switch(code)
    {
        case OK: 
            Game.creeps[creepName].memory.task = new Task({
                name: "Transport",
                creep: creepName,
                data:
                {
                    state: TRANSPORTER_STATE.IDLE
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