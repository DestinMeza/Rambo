const CreepBuilder = require("./creepBuilder");

const PROCESS = {
    RUNNING: 0,
    FAILURE: 1,
    SUCCESS: 2
};

function process (self) {
    const creepName = self.creepName;
    const spawn = Game.getObjectById(self.spawnId);
    const requiredBodyParts = self.requiredBodyParts;
    const possibleBodyParts = self.possibleBodyParts;
    const body = CreepBuilder.getCreepBody(requiredBodyParts, possibleBodyParts, spawn.room.name);

    let code = spawn.spawnCreep(body, creepName);
    
    switch(code)
    {
        case OK:

            if(self.nextAction)
            {
                self.nextAction.spawnId = self.spawnId;
                self.nextAction.creepName = self.creepName;
            }

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