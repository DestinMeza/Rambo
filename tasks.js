const HarvestAndReturnTask = require("./harvestAndReturnTask");
const UpgradeTask = require("./upgradeTask");
const BuildLocalTask = require("./buildLocalTask");
const TransportTask = require("./transporterTask");

const taskKeys = {
    Harvest_Return_Local: "Harvest_Return_Local",
    Upgrade_Local: "Upgrade_Local",
    Build_Local: "Build_Local",
    Transport_Local: "Transport_Local"
}

module.exports = {
    [taskKeys.Harvest_Return_Local]: HarvestAndReturnTask,
    [taskKeys.Upgrade_Local]: UpgradeTask,
    [taskKeys.Build_Local]: BuildLocalTask,
    [taskKeys.Transport_Local]: TransportTask,
    keys: taskKeys,
};