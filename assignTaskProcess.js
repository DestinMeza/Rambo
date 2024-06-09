const PROCESS = {
    RUNNING: 0,
    FAILURE: 1,
    SUCCESS: 2
};

function process (self) {

    const spawn = Game.getObjectById(self.spawnId);

    if(spawn.spawning != null)
    {
        self.creepName = spawn.spawning.name;

        return PROCESS.RUNNING;
    }

    const creep = Game.creeps[self.creepName];
    
    if(creep == undefined || creep.spawning)
    {
        return PROCESS.RUNNING;
    }

    creep.memory.task = {
        name: self.task,
        creep: creep.name,
        hasStarted: false,
        roomController: spawn.room.controller.id,
        state: 0,
    }

    return PROCESS.SUCCESS;
}

module.exports = process;