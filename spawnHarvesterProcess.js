function process (objectInfo) {

    let creepName = "Test Creep " +  objectInfo.randomNumber;
    let code = objectInfo.spawn.spawnCreep([WORK, MOVE, CARRY], creepName);
    
    switch(code)
    {
        case OK: 
            Game.creeps[creepName].memory.task = new Task({
                name: "Harvest and Return",
                creep: creep,
                data:
                {
                    state: 0
                }
            })

            return PROCESS.SUCCESS;
        default:
            return PROCESS.FAILURE;
    }
}

module.exports = process;