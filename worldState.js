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
        this.constructionSites = this.room.find(FIND_MY_CONSTRUCTION_SITES);
        this.roomController = this.room.controller;
        this.roomControllerLevel = this.roomController.level;
        this.energy = this.store[RESOURCE_ENERGY];
        this.energyCapacity = this.store.getCapacity(RESOURCE_ENERGY);
        this.randomNumber = Math.floor(Math.random() * 10000);
        this.capacityRatio = this.store.getUsedCapacity(RESOURCE_ENERGY) / this.store.getCapacity(RESOURCE_ENERGY);
        this.creepsAlive = 0;
        this.harvesters = 0;
        this.upgraders = 0;
        this.builders = 0;
        this.constructionSiteCount = this.constructionSites.length;
        this.isMaxBuildingCount = true;

        let roomMemory = Memory.rooms[this.room.name];

        if(roomMemory != undefined)
        {
            let blueprint = roomMemory.blueprint;

            if(blueprint != undefined)
            {
                for(const buildingKey in blueprint.buildings)
                {
                    const building = blueprint.buildings[buildingKey];
                    let maxCount = CONTROLLER_STRUCTURES[building.type][this.roomControllerLevel];
                    let bluePrintMax = building.positions.length;

                    if(maxCount == 0)
                    {
                        continue;   
                    }

                    let currentStructureCount = this.room.find(FIND_MY_STRUCTURES, {
                        filter: { structureType: building.type }
                    }).length;

                    if(currentStructureCount < maxCount && currentStructureCount < bluePrintMax)
                    {
                        this.isMaxBuildingCount = false;
                        break;
                    }
                }
            }
        }

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
            if(Game.creeps[creep].memory.task.name == "Build_Local")
            {
                this.builders += 1;
            }
        }
        
        this.setConditions();
    }

    setConditions()
    {
        this.conditions = {
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
            Builder_Count_Threshold_Met: new Condition({
                name: "Builder_Count_Threshold_Met",
                condition: this.builders > 5
            }),
            Builder_Count_Threshold_Not_Met: new Condition({
                name: "Builder_Count_Threshold_Not_Met",
                condition: this.builders <= 5
            }),
            Builder_Energy_Cost: new Condition({
                name: "Builder_Energy_Cost",
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
            Energy_Not_At_MaxCapacity: new Condition({
                name: "Energy_Not_At_MaxCapacity",
                condition: this.energy < this.energyCapacity
            }),
            Max_Building_Count_Reached: new Condition({
                name: "Max_Building_Count_Reached",
                condition: this.isMaxBuildingCount,
            }),
            Max_Building_Count_Not_Reached: new Condition({
                name: "Max_Building_Count_Not_Reached",
                condition: !this.isMaxBuildingCount,
            }),
            Active_Construction: new Condition({
                name: "Active_Construction",
                condition: this.constructionSiteCount > 0,
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
            Spawn_Harvester: [
                this.conditions.Harvester_Energy_Cost, 
                this.conditions.Not_Spawning
            ],
            Spawn_Upgrader: [
                this.conditions.Upgrader_Energy_Cost, 
                this.conditions.Not_Spawning
            ],
            Spawn_Builder: [
                this.conditions.Active_Construction,
                this.conditions.Builder_Energy_Cost,
                this.conditions.Not_Spawning
            ],
            Place_Construction_Sites: [
                this.conditions.Max_Building_Count_Not_Reached
            ]
        }

        this.actionPostConditionMap = {
            Spawn_Harvester: [
                this.conditions.Energy_At_MaxCapacity
            ],
            Spawn_Upgrader: [
                this.conditions.Room_Upgrading
            ],
            Spawn_Builder: [
                this.conditions.Max_Building_Count_Reached
            ],
            Place_Construction_Sites: [
                this.conditions.Active_Construction
            ]
        }

        this.goalPreConditionMap = {
            Collect_Energy: [
                this.conditions.Not_Spawning,
                this.conditions.Harvester_Energy_Cost,
                this.conditions.Harvester_Count_Threshold_Not_Met,
                this.conditions.Energy_Not_At_MaxCapacity
            ],
            Upgrade_Room: [
                this.conditions.Not_Spawning,
                this.conditions.Upgrader_Energy_Cost,
                this.conditions.Upgrader_Count_Threshold_Not_Met
            ],
            Build_Additional_Structures: [
                this.conditions.Max_Building_Count_Not_Reached
            ]
        }

        this.goalPostConditionMap = {
            Collect_Energy: [
                this.conditions.Energy_At_MaxCapacity
            ],
            Upgrade_Room: [
                this.conditions.Room_Upgrading
            ],
            Build_Additional_Structures: [
                this.conditions.Max_Building_Count_Reached
            ]
        }

        this.goalPriorityMap = 
        {
            Collect_Energy: 1.0,
            Upgrade_Room: 1.0,
            Build_Additional_Structures: 1.0,
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