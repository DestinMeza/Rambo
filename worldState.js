const Condition = require("./condition");

class WorldState
{
    constructor()
    {
        this.process();
    }

    process()
    {
        this.spawn = Game.spawns['Spawn1'];
        this.store = this.spawn.store;
        this.energy = this.store[RESOURCE_ENERGY];
        this.energyCapacity = this.store.getCapacity(RESOURCE_ENERGY);
        this.randomNumber = Math.floor(Math.random() * 10000);
        this.capacityRatio = this.store.getUsedCapacity(RESOURCE_ENERGY) / this.store.getCapacity(RESOURCE_ENERGY);
        this.creepsWithoutTaskCount = 0;

        for(const creep in Game.creeps)
        {
            if(Game.creeps[creep].memory.task == undefined)
            {
                this.creepsWithoutTaskCount += 1;
            }
        }

        this.conditions = {
            Idle: new Condition({
                name: "Idle",
                condition: true
            }),
            Idle_Creeps: new Condition({
                name: "Idle_Creeps",
                condition: this.creepsWithoutTaskCount > 0
            }),
            Creep_Spawn_Cost: new Condition({
                name: "Creep_Spawn_Cost",
                condition: this.energy > 200
            }),
            Wait_For_Spawn: new Condition({
                name: "Wait For Spawn",
                condition: this.spawn.spawning == undefined
            })
        };

        this.actionPreConditionMap = {
            Idle: [this.conditions.Idle],
            Spawn_Harvester: [
                this.conditions.Creep_Spawn_Cost, 
                this.conditions.Wait_For_Spawn
            ]
        }

        this.actionPostConditionMap = {
            Idle: [this.conditions.Idle],
            Spawn_Harvester: [
                this.conditions.Creep_Spawn_Cost, 
                this.conditions.Wait_For_Spawn
            ]
        }

        this.goalPreConditionMap = {
            Idle: [this.conditions.Idle],
            Collect_Resource: [this.conditions.Idle_Creeps],
            Spawn_Harvester: [
                this.conditions.Creep_Spawn_Cost, 
                this.conditions.Wait_For_Spawn
            ]
        }

        this.goalPostConditionMap = {
            Idle: [this.conditions.Idle],
            Collect_Resource: [this.conditions.Idle_Creeps],
            Spawn_Harvester: [
                this.conditions.Creep_Spawn_Cost, 
                this.conditions.Wait_For_Spawn
            ]
        }
    }

    simulateStateChange(effects)
    {
        effects.forEach(effect => {
            effect();
        });

        this.conditions = {
            ["Idle"]: new Condition({
                name: "Idle",
                condition: true
            }),
            ["Idle Creeps"]: new Condition({
                name: "Idle Creeps",
                condition: this.creepsWithoutTaskCount > 0
            }),
            ["Creep Spawn Cost"]: new Condition({
                name: "Creep Spawn Cost",
                condition: this.energy > 200
            }),
            ["Wait For Spawn"]: new Condition({
                name: "Wait For Spawn",
                condition: this.spawn.spawning == undefined
            })
        };

        this.actionPreConditionMap = {
            ["Idle"]: [this.conditions["Idle"]],
            ["Assign Creep Task"]: [this.conditions["Idle Creeps"]],
            ["Spawn Creep"]: [
                this.conditions["Creep Spawn Cost"], 
                this.conditions["Wait For Spawn"]
            ]
        }
        
        this.actionPostConditionMap = {
            ["Idle"]: [this.conditions["Idle"]],
            ["Assign Creep Task"]: [this.conditions["Idle Creeps"]],
            ["Spawn Creep"]: [
                this.conditions["Creep Spawn Cost"], 
                this.conditions["Wait For Spawn"]
            ]
        }

        this.goalPreConditionMap = {
            ["Idle"]: [this.conditions["Idle"]],
            ["Collect Resource"]: [this.conditions["Idle Creeps"]],
            ["Spawn Creep"]: [
                this.conditions["Creep Spawn Cost"], 
                this.conditions["Wait For Spawn"]
            ]
        }

        this.goalPostConditionMap = {
            ["Idle"]: [this.conditions["Idle"]],
            ["Collect Resource"]: [this.conditions["Idle Creeps"]],
            ["Spawn Creep"]: [
                this.conditions["Creep Spawn Cost"], 
                this.conditions["Wait For Spawn"]
            ]
        }
    }
}

module.exports = WorldState;