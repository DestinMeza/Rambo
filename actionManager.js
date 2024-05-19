const Action = require("./action");

//Action Processes
const idleProcess = require("./idleProcess");
const spawnHarvesterProcess = require("./spawnHarvesterProcess");

const PROCESS = Object.freeze({
    RUNNING: 0,
    FAILURE: 1,
    SUCCESS: 2
});

class ActionManager
{
    constructor(info)
    {
        this.commander = info.commander;
        this.worldState = info.worldState;

        this.updateConditionMaps();

        this.actionMap = {
            Idle: new Action({
                name: "Idle",
                effects: [],
                process: (objectInfo) => idleProcess(objectInfo),
            }),
            Spawn_Harvester: new Action({
                name: "Spawn_Harvester",
                effects: [],
                process: (objectInfo) => spawnHarvesterProcess(objectInfo),
            })
        };
    }

    process() {
        setActionProcessData();

        for(const key in this.actionMap) {
            this.actionMap[key].preConditions = this.worldState.actionPreConditionMap[key];
            this.actionMap[key].postConditions = this.worldState.actionPostConditionMap[key];            
        }
    }

    setActionProcessData()
    {
        this.actionMap.Idle.data = {
            duration: 5
        }
        this.actionMap.Spawn_Harvester.data = {
            randomNumber: this.worldState.randomNumber,
            spawn: this.worldState.spawn
        }
    }
    
    getSavedActions() {
        const savedCommander = Memory[this.commander];

        if(savedCommander.plan == null) {
            return null;
        }

        const actions = savedCommander.plan.actions;

        let actionObjects = [];
        
        for(const action in actions) {
            actionObjects[action] = this.actionMap[actions[action].name];
        }

        return actionObjects;
    }
}

module.exports = ActionManager;