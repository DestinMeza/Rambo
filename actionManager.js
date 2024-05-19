const Action = require("./action");
const WorldState = require("./worldState");
const Task = require("./task");
const Goal = require("./goal");

const PROCESS = Object.freeze({
    RUNNING: 0,
    FAILURE: 1,
    SUCCESS: 2
});

class ActionManager
{
    constructor(commander)
    {
        this.commander = commander;

        this.worldState = new WorldState();

        this.updateConditionMaps();

        this.actionMap = {
            ["Idle"]: new Action({
                name: "Idle",
                process: () => {
                    
                    if(this.actionMap["Idle"].startTime == undefined)
                    {
                        this.actionMap["Idle"].startTime = Game.time;
                        this.actionMap["Idle"].duration = 7;
                    }

                    if(Game.time - this.actionMap["Idle"].startTime < this.actionMap["Idle"].duration)
                    {
                        return PROCESS.RUNNING;
                    }

                    return PROCESS.SUCCESS;
                }
            }),
            ["Assign Creep Task"]: new Action({
                name: "Assign Creep Task",
                process: () => {
                    for(const creep in Game.creeps)
                    {
                        if(Game.creeps[creep].memory.task == undefined)
                        {
                            Game.creeps[creep].memory.task = new Task({
                                name: "Harvest and Return",
                                creep: creep,
                                data:
                                {
                                    state: 0
                                }
                            })
                        }
                    }
    
                    return PROCESS.SUCCESS;
                }
            }),
            ["Spawn Creep"]: new Action({
                name: "Spawn Creep",
                process: () => {
                    let code = this.worldState.spawn.spawnCreep([WORK, MOVE, CARRY], "Test Creep " +  this.worldState.randomNumber);
        
                    switch(code)
                    {
                        case OK: 
                            return PROCESS.SUCCESS;
                        default:
                            return PROCESS.FAILURE;
                    }
                }
            })
        };

        this.goalMap = 
        {
            ["Idle"]: new Goal({
                name: "Idle",
                priority: 0.1,
            }),
            ["Spawn Creep"]: new Goal({
                name: "Spawn Creep",
                priority: this.worldState.capacityRatio,
            }),
            ["Collect Resource"]: new Goal({
                name: "Collect Resource",
                priority: 1.0,
            })
        }
    }

    process() {
        this.worldState.process();

        this.updateConditionMaps();

        for(const key in this.actionMap) {
            this.actionMap[key].conditions = this.actionConditionMap[key];            
        }

        for(const key in this.goalMap) {
            this.goalMap[key].conditions = this.goalConditionMap[key];            
        }
    }

    updateConditionMaps() {
        this.actionConditionMap = {
            ["Idle"]: [this.worldState.conditions["Idle"]],
            ["Assign Creep Task"]: [this.worldState.conditions["Idle Creeps"]],
            ["Spawn Creep"]: [
                this.worldState.conditions["Creep Spawn Cost"], 
                this.worldState.conditions["Wait For Spawn"]
            ]
        }

        this.goalConditionMap = {
            ["Idle"]: [this.worldState.conditions["Idle"]],
            ["Collect Resource"]: [this.worldState.conditions["Idle Creeps"]],
            ["Spawn Creep"]: [
                this.worldState.conditions["Creep Spawn Cost"], 
                this.worldState.conditions["Wait For Spawn"]
            ]
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