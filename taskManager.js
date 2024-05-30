const HarvestAndReturnTask = require("./harvestAndReturnTask");
const UpgradeTask = require("./upgradeTask");
const BuildLocalTask = require("./buildLocalTask");
const TransportTask = require("./transporterTask");

class TaskManager
{
    constructor()
    {
        this.taskMap = {
            ["Harvest and Return"]: HarvestAndReturnTask,
            ["Upgrade"]: UpgradeTask,
            ["Build Local"]: BuildLocalTask,
            ["Transport"]: TransportTask
        };
    }
}

module.exports = TaskManager;