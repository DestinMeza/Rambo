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
    
    if(creep == undefined)
    {
        return PROCESS.FAILURE;
    }

    creep.memory.task = {
        name: self.task,
        creep: creep.name,
        state: 0,
    }

    return PROCESS.SUCCESS;
}

module.exports = process;