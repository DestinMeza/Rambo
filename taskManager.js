const HarvestAndReturnTask = require("./harvestAndReturnTask");
const UpgradeTask = require("./upgradeTask");
class TaskManager
{
    constructor()
    {
        this.taskMap = {
            ["Harvest and Return"]: HarvestAndReturnTask,
            ["Upgrade"]: UpgradeTask
        };
    }
}

module.exports = TaskManager;