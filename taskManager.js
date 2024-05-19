const HarvestAndReturnTask = require("./harvestAndReturnTask");

class TaskManager
{
    constructor()
    {
        this.taskMap = {
            ["Harvest and Return"]: HarvestAndReturnTask,
        };
    }
}

module.exports = TaskManager;