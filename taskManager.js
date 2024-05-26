const HarvestAndReturnTask = require("./harvestAndReturnTask");
const UpgradeTask = require("./upgradeTask");
const BuildLocalTask = require("./buildLocalTask");
class TaskManager
{
    constructor()
    {
        this.taskMap = {
            ["Harvest and Return"]: HarvestAndReturnTask,
            ["Upgrade"]: UpgradeTask,
            ["Build Local"]: BuildLocalTask
        };
    }
}

module.exports = TaskManager;