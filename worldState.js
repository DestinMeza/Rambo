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
        this.transports = 0;
        this.constructionSiteCount = this.constructionSites.length;
        this.isMaxBuildingCount = true;

        const roomMemory = Memory.rooms[this.room.name];

        if(roomMemory != undefined)
        {
            this.blueprint = roomMemory.blueprint;

            if(this.blueprint != undefined)
            {
                for(const buildingKey in this.blueprint.buildings)
                {
                    const building = this.blueprint.buildings[buildingKey];
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
            const creepObj = Game.creeps[creep];

            if(creepObj == undefined || creepObj.memory.task == undefined)
            {
                continue;   
            }

            this.creepsAlive += 1;

            if(creepObj.memory.task.name == "Harvest and Return")
            {
                this.harvesters += 1;
            }
            if(creepObj.memory.task.name == "Upgrade")
            {
                this.upgraders += 1;
            }
            if(creepObj.memory.task.name == "Build Local")
            {
                this.builders += 1;
            }
            if(creepObj.memory.task.name == "Transport")
            {
                this.transports += 1;
            }
        }
        
        this.setConditions();
    }

    setConditions()
    {
        this.conditions = {
            Base_Level_Greater_Than_1: new Condition({
                name: "Base_Level_Greater_Than_1",
                condition: this.roomControllerLevel > 1
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
                condition: this.upgraders >= 2
            }),
            Upgrader_Count_Threshold_Not_Met: new Condition({
                name: "Upgrader_Count_Threshold_Not_Met",
                condition: this.upgraders < 2
            }),
            Upgrader_Energy_Cost: new Condition({
                name: "Upgrader_Energy_Cost",
                condition: this.energy > 200
            }),
            Builder_Count_Threshold_Met: new Condition({
                name: "Builder_Count_Threshold_Met",
                condition: this.builders >= 2
            }),
            Builder_Count_Threshold_Not_Met: new Condition({
                name: "Builder_Count_Threshold_Not_Met",
                condition: this.builders < 2
            }),
            Builder_Energy_Cost: new Condition({
                name: "Builder_Energy_Cost",
                condition: this.energy > 200
            }),
            Transporter_Count_Threshold_Met: new Condition({
                name: "Transporter_Count_Threshold_Met",
                condition: this.transports >= 8
            }),
            Transporter_Count_Threshold_Not_Met: new Condition({
                name: "Transporter_Count_Threshold_Not_Met",
                condition: this.transports < 8
            }),
            Transporter_Energy_Cost: new Condition({
                name: "Transporter_Energy_Cost",
                condition: this.energy > 100
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
            Can_Place_Structures: new Condition({
                name: "Can_Place_Structures",
                condition: this.constructionSiteCount < 100
            }),
            Blueprint_Exist: new Condition({
                name: "Blueprint_Exist",
                condition: this.blueprint != undefined
            }),
            Transporter_Count_Ratio_Not_Exceeded: new Condition({
                name: "Transporter_Count_Ratio_Not_Exceeded",
                condition: this.transports / Math.max(0, this.harvesters) < 2
            }),
            Creep_Count_Zero: new Condition({
                name: "Creep_Count_Zero",
                condition: this.creepsAlive == 0
            }),
            Creep_Count_Not_Zero: new Condition({
                name: "Creep_Count_Not_Zero",
                condition: this.creepsAlive != 0
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
                this.conditions.Not_Spawning,
                this.conditions.Blueprint_Exist
            ],
            Spawn_Transporter: [
                this.conditions.Creep_Count_Not_Zero,
                this.conditions.Transporter_Energy_Cost,
                this.conditions.Not_Spawning,
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
            Spawn_Transporter: [
                this.conditions.Creep_Count_Not_Zero
            ],
            Place_Construction_Sites: [
                this.conditions.Blueprint_Exist,
                this.conditions.Active_Construction
            ]
        }

        this.goalPreConditionMap = {
            Collect_Energy: [
                this.conditions.Not_Spawning,
                this.conditions.Harvester_Energy_Cost,
                this.conditions.Harvester_Count_Threshold_Not_Met,
            ],
            Upgrade_Room: [
                this.conditions.Creep_Count_Not_Zero,
                this.conditions.Not_Spawning,
                this.conditions.Upgrader_Energy_Cost,
                this.conditions.Upgrader_Count_Threshold_Not_Met
            ],
            Create_Transports: [
                this.conditions.Transporter_Count_Ratio_Not_Exceeded,
                this.conditions.Transporter_Count_Threshold_Not_Met,
                this.conditions.Creep_Count_Not_Zero,
                this.conditions.Not_Spawning,
            ],
            Create_Builders: [
                this.conditions.Creep_Count_Not_Zero,
                this.conditions.Active_Construction,
                this.conditions.Not_Spawning,
                this.conditions.Builder_Energy_Cost,
                this.conditions.Builder_Count_Threshold_Not_Met,
                this.conditions.Base_Level_Greater_Than_1,
            ],
            Build_Additional_Structures: [
                this.conditions.Creep_Count_Not_Zero,
                this.conditions.Can_Place_Structures,
                this.conditions.Base_Level_Greater_Than_1,
                this.conditions.Max_Building_Count_Not_Reached,
                this.conditions.Harvester_Count_Threshold_Met,
            ]
        }

        this.goalPostConditionMap = {
            Collect_Energy: [
                this.conditions.Energy_At_MaxCapacity
            ],
            Upgrade_Room: [
                this.conditions.Room_Upgrading
            ],
            Create_Builders: [
                this.conditions.Max_Building_Count_Reached
            ],
            Create_Transports: [
                this.conditions.Creep_Count_Not_Zero,
            ],
            Build_Additional_Structures: [
                this.conditions.Max_Building_Count_Reached
            ],
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