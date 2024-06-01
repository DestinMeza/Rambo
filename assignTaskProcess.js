const PROCESS = {
    RUNNING: 0,
    FAILURE: 1,
    SUCCESS: 2
};

function process (self) {
    const creep = Game.getObjectById(self.creepID);
    
    if(creep == undefined)
    {
        return PROCESS.FAILURE;   
    }

    creep.memory.task = self.task;

    return SUCCESS;
}

module.exports = process;