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
        this.room = this.spawn.room;
        this.roomController = this.room.controller;
        this.energy = this.store[RESOURCE_ENERGY];
        this.energyCapacity = this.store.getCapacity(RESOURCE_ENERGY);
        this.randomNumber = Math.floor(Math.random() * 10000);
        this.capacityRatio = this.store.getUsedCapacity(RESOURCE_ENERGY) / this.store.getCapacity(RESOURCE_ENERGY);
        this.creepsAlive = 0;
        this.harvesters = 0;
        this.upgraders = 0;

        for(const creep in Game.creeps)
        {
            if(Game.creeps[creep] == undefined)
            {
                continue;   
            }

            this.creepsAlive += 1;

            if(Game.creeps[creep].memory.task.name == "Harvest and Return")
            {
                this.harvesters += 1;
            }
            if(Game.creeps[creep].memory.task.name == "Upgrade")
            {
                this.upgraders += 1;
            }
        }
        
        this.setConditions();
    }

    setConditions()
    {
        this.conditions = {
            Idle: new Condition({
                name: "Idle",
                condition: true
            }),
            Harvester_Count_Threshold_Met: new Condition({
                name: "Harvester_Count_Threshold_Met",
                condition: this.harvesters > 5
            }),
            Harvester_Count_Threshold_Not_Met: new Condition({
                name: "Harvester_Count_Threshold_Not_Met",
                condition: this.harvesters <= 5
            }),
            Harvester_Energy_Cost: new Condition({
                name: "Harvester_Energy_Cost",
                condition: this.energy > 200
            }),
            Upgrader_Count_Threshold_Met: new Condition({
                name: "Upgrader_Count_Threshold_Met",
                condition: this.upgraders > 5
            }),
            Upgrader_Count_Threshold_Not_Met: new Condition({
                name: "Upgrader_Count_Threshold_Not_Met",
                condition: this.upgraders <= 5
            }),
            Upgrader_Energy_Cost: new Condition({
                name: "Upgrader_Energy_Cost",
                condition: this.energy > 200
            }),
            Not_Spawning: new Condition({
                name: "Not_Spawning",
                condition: this.spawn.spawning == undefined
            }),
            Energy_At_MaxCapacity: new Condition({
                name: "Energy_At_MaxCapacity",
                condition: this.energy >= this.energyCapacity
            }),
            Room_Upgrading: new Condition({
                name: "Room_Upgrading",
                condition: this.upgraders > 0, 
            }),
            Room_Downgrade_Threshold: new Condition({
                name: "Room_Downgrade_Threshold",
                condition: this.roomController.ticksToDownGrade <= 10000, 
            }),
            Room_Can_LevelUp: new Condition({
                name: "Room_Can_LevelUp",
                condition: this.energy >= this.roomController.progressTotal - this.roomController.process
            }),
        };

        this.actionPreConditionMap = {
            Idle: [
                this.conditions.Idle
            ],
            Spawn_Harvester: [
                this.conditions.Harvester_Energy_Cost, 
                this.conditions.Not_Spawning
            ],
            Spawn_Upgrader: [
                this.conditions.Upgrader_Energy_Cost, 
                this.conditions.Not_Spawning
            ]
        }

        this.actionPostConditionMap = {
            Idle: [
                this.conditions.Idle
            ],
            Spawn_Harvester: [
                this.conditions.Energy_At_MaxCapacity
            ],
            Spawn_Upgrader: [
                this.conditions.Room_Upgrading
            ]
        }

        this.goalPreConditionMap = {
            Idle: [
                this.conditions.Idle
            ],
            Collect_Energy: [
                this.conditions.Not_Spawning,
                this.conditions.Harvester_Energy_Cost,
                this.conditions.Harvester_Count_Threshold_Not_Met
            ],
            Upgrade_Room: [
                this.conditions.Not_Spawning,
                this.conditions.Upgrader_Energy_Cost,
                this.conditions.Upgrader_Count_Threshold_Not_Met
            ]
        }

        this.goalPostConditionMap = {
            Idle: [
                this.conditions.Idle
            ],
            Collect_Energy: [
                this.conditions.Energy_At_MaxCapacity
            ],
            Upgrade_Room: [
                this.conditions.Room_Upgrading
            ]
        }

        this.goalPriorityMap = 
        {
            Idle: 0.01,
            Collect_Energy: 1.0,
            Upgrade_Room: 1.0
        }
    }

    simulateStateChange(effects)
    {
        effects.forEach(effect => {
            effect(this);
        });

        this.setConditions();
    }
}

module.exports = WorldState;