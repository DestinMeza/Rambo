const Action = require("./action");

//Action Processes
const spawnHarvesterProcess = require("./spawnHarvesterProcess");
const spawnUpgraderProcess = require("./spawnUpgraderProcess");
const spawnLocalBuilderProcess = require("./spawnBuilderProcess");
const placeLocalConstructionSiteProcess = require("./placeLocalConstructionSitesProcess");

const PROCESS = Object.freeze({
    RUNNING: 0,
    FAILURE: 1,
    SUCCESS: 2
});

class ActionManager
{
    constructor(info)
    {
        this.commanderName = info.commanderName;
        this.worldState = info.worldState;

        this.actionMap = {
            Spawn_Harvester: new Action({
                name: "Spawn_Harvester",
                effects: [(worldSim) => {
                    worldSim.harvesters = worldSim.harvesters + 1;
                    worldSim.creepsAlive = worldSim.creepsAlive + 1;
                }],
                process: (self) => spawnHarvesterProcess(self),
                start: (self) => {}
            }),
            Spawn_Upgrader: new Action({
                name: "Spawn_Upgrader",
                effects: [(worldSim) => {
                    worldSim.upgraders = worldSim.upgraders + 1;
                    worldSim.creepsAlive = worldSim.creepsAlive + 1;
                }],
                process: (self) => spawnUpgraderProcess(self),
                start: (self) => {}
            }),
            Spawn_Builder: new Action({
                name: "Spawn_Builder",
                effects: [(worldSim) => {
                    worldSim.builders = worldSim.builders + 1;
                    worldSim.creepsAlive = worldSim.creepsAlive + 1;
                }],
                process: (self) => spawnLocalBuilderProcess(self),
                start: (self) => {}
            }),
            Place_Construction_Sites: new Action({
                name: "Place_Construction_Sites",
                effects: [(worldSim) => {
                    worldSim.constructionSiteCount = worldSim.constructionSiteCount + 1;
                }],
                process: (self) => placeLocalConstructionSiteProcess(self),
                start: (self) => {}
            }),
        };
    }

    getActions()
    {
        let actionArray = [];
        
        for(const actionKey in this.actionMap)
        {
            actionArray.push(this.actionMap[actionKey]);
        }

        return actionArray;
    }

    process() {
        this.setActionProcessData();

        for(const key in this.actionMap) {
            this.actionMap[key].preConditions = this.worldState.actionPreConditionMap[key];
            this.actionMap[key].postConditions = this.worldState.actionPostConditionMap[key];            
        }
    }

    setActionProcessData()
    {
        this.actionMap.Spawn_Harvester.data = {
            randomNumber: this.worldState.randomNumber,
            spawnId: this.worldState.spawn.id
        }
        this.actionMap.Spawn_Upgrader.data = {
            randomNumber: this.worldState.randomNumber,
            spawnId: this.worldState.spawn.id
        }
        this.actionMap.Spawn_Builder.data = {
            randomNumber: this.worldState.randomNumber,
            spawnId: this.worldState.spawn.id
        }
        this.actionMap.Place_Construction_Sites.data = {
            roomName: this.worldState.room.name
        }
    }
    
    getSavedActions() {
        const savedCommander = Memory[this.commanderName];

        if(savedCommander.plan == null) {
            return null;
        }

        const actions = savedCommander.plan.actions;

        let actionObjects = [];
        
        for(const action in actions) {
            actionObjects[action] = this.actionMap[actions[action].name];

            for(const savedKey in actions[action])
            {
                if(savedKey == "name") {
                    continue;
                }

                actionObjects[action][savedKey] = actions[action][savedKey];
            }
        }

        return actionObjects;
    }
}

module.exports = ActionManager;