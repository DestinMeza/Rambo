const ROOM_CONDITIONS = {
    Room_Upgrading: 
    {
        name: "Room_Upgrading",
        getCondition: (roomInfo) => roomInfo.upgraders > 0
    },
    Room_Owned_By_Me:
    {
        name: "Room_Owned_By_Me",
        getCondition: (roomInfo) => roomInfo.my
    },
    Room_Downgrade_Threshold:
    {
        name: "Room_Downgrade_Threshold",
        getCondition: (roomInfo) => roomInfo.room.controller.ticksToDownGrade <= 10000, 
    },
    Room_Can_LevelUp: {
        name: "Room_Can_LevelUp",
        getCondition: (roomInfo) =>  roomInfo.energy >= roomInfo.controller.progressTotal - roomInfo.controller.progress
    },
    Room_Is_Not_Ignore: {
        name: "Room_Is_Not_Ignore",
        getCondition: (roomInfo) => {
            const room = roomInfo.room;

            return !room.memory.ignore;
        }
    },
    Room_Has_No_Blueprint: {
        name: "Room_Has_No_Blueprint",
        getCondition: (roomInfo) => roomInfo.blueprint == undefined
    },
    Room_Has_Blueprint: {
        name: "Room_Has_Blueprint",
        getCondition: (roomInfo) => roomInfo.blueprint != undefined
    },
    Room_Builders_Need_Assignment: {
        name: "Room_Builders_Need_Assignment",
        getCondition: (roomInfo) => {
            for(const builderIndex in roomInfo.builders)
            {
                const builderInfo = Game.creeps[roomInfo.builders[builderIndex]];


                if(builderInfo == undefined)
                {
                    continue;   
                }

                if(builderInfo.memory == undefined)
                {
                    continue;    
                }
                
                if(builderInfo.memory.task == undefined)
                {
                    continue;
                }

                if(builderInfo.memory.task.requestingSite == true)
                {
                    return true;
                }
            }

            return false;
        }
    },
    Base_Level_Greater_Than_1: {
        name: "Base_Level_Greater_Than_1",
        getCondition: (roomInfo) =>  roomInfo.controller.level > 1
    },
    Spawning_Creep: {
        name: "Spawning_Creep",
        getCondition: (roomInfo) =>  roomInfo.room.find(FIND_MY_SPAWNS, {
            filter: function(spawn)
            {
                return spawn.spawning;
            }
        }).length > 0
    },
    Spawning_Worker:
    {
        name: "Spawning_Worker",
        getCondition: (roomInfo) =>  roomInfo.room.find(FIND_MY_SPAWNS, {
            filter: function(spawn)
            {
                if(spawn.spawning == undefined)
                {
                    return false;
                }

                spawn.spawning.name.match("Worker");
            }
        }).length > 0
    },
    Spawning_Transport:
    {
        name: "Spawning_Transport",
        getCondition: (roomInfo) =>  roomInfo.room.find(FIND_MY_SPAWNS, {
            filter: function(spawn)
            {
                if(spawn.spawning == undefined)
                {
                    return false;
                }

                spawn.spawning.name.match("Transporter");
            }
        }).length > 0
    },
    Harvester_Count_Threshold_Met: {
        name: "Harvester_Count_Threshold_Met",
        getCondition: (roomInfo) =>  roomInfo.harvesters.length > roomInfo.sourceSaturation
    },
    Harvester_Count_Threshold_Not_Met: {
        name: "Harvester_Count_Threshold_Not_Met",
        getCondition: (roomInfo) =>  roomInfo.harvesters.length <= roomInfo.sourceSaturation
    },
    Transporter_Count_Threshold_Met: {
        name: "Transporter_Count_Threshold_Met",
        getCondition: (roomInfo) => roomInfo.upgraders.length >= roomInfo.harvesters.length * 2
    },
    Transporter_Count_Threshold_Not_Met: {
        name: "Transporter_Count_Threshold_Not_Met",
        getCondition: (roomInfo) => roomInfo.transports.length < roomInfo.harvesters.length * 2
    },
    Builder_Count_Threshold_Met: {
        name: "Builder_Count_Threshold_Met",
        getCondition: (roomInfo) =>  roomInfo.builders.length > 4
    },
    Builder_Count_Threshold_Not_Met: {
        name: "Builder_Count_Threshold_Not_Met",
        getCondition: (roomInfo) =>  roomInfo.builders.length <= 4
    },
    Upgrader_Count_Threshold_Met: {
        name: "Upgrader_Count_Threshold_Met",
        getCondition: (roomInfo) => roomInfo.upgraders.length >= 3
    },
    Upgrader_Count_Threshold_Not_Met: {
        name: "Upgrader_Count_Threshold_Not_Met",
        getCondition: (roomInfo) => roomInfo.upgraders.length < 3
    },
    WorkerBody_Energy_Cost: {
        name: "WorkerBody_Energy_Cost",
        getCondition: (roomInfo) => roomInfo.energy > 200
    },
    TransporterBody_Energy_Cost: {
        name: "TransporterBody_Energy_Cost",
        getCondition: (roomInfo) => roomInfo.energy > 100
    },
    Energy_At_MaxCapacity: {
        name: "Energy_At_MaxCapacity",
        getCondition: (roomInfo) =>  roomInfo.energy >= roomInfo.energyCapacity
    },
    Energy_Not_At_MaxCapacity: {
        name: "Energy_Not_At_MaxCapacity",
        getCondition: (roomInfo) =>  roomInfo.energy < roomInfo.energyCapacity
    },
}

module.exports = ROOM_CONDITIONS;