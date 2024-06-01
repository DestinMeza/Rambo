const ROOM_CONDITIONS = {
    Room_Upgrading: 
    {
        name: "Room_Upgrading",
        getCondition: (roomInfo) => roomInfo.upgraders > 0
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
    Harvester_Count_Threshold_Met: {
        name: "Harvester_Count_Threshold_Met",
        getCondition: (roomInfo) =>  roomInfo.harvesters.length > 5
    },
    Harvester_Count_Threshold_Not_Met: {
        name: "Harvester_Count_Threshold_Not_Met",
        getCondition: (roomInfo) =>  roomInfo.harvesters.length <= 5
    },
    Harvester_Energy_Cost: {
        name: "Harvester_Energy_Cost",
        getCondition: (roomInfo) =>  roomInfo.energy > 200
    },
    Upgrader_Count_Threshold_Met: {
        name: "Upgrader_Count_Threshold_Met",
        getCondition: (roomInfo) =>  roomInfo.upgraders >= 2
    },
    Upgrader_Count_Threshold_Not_Met: {
        name: "Upgrader_Count_Threshold_Not_Met",
        getCondition: (roomInfo) =>  roomInfo.upgraders  < 2
    },
    Upgrader_Energy_Cost: {
        name: "Upgrader_Energy_Cost",
        getCondition: (roomInfo) =>  roomInfo.energy > 200
    },
    Builder_Count_Threshold_Met: {
        name: "Builder_Count_Threshold_Met",
        getCondition: (roomInfo) =>  roomInfo.builders >= 2
    },
    Builder_Count_Threshold_Not_Met: {
        name: "Builder_Count_Threshold_Not_Met",
        getCondition: (roomInfo) =>  roomInfo.builders < 2
    },
    Builder_Energy_Cost: {
        name: "Builder_Energy_Cost",
        getCondition: (roomInfo) =>  roomInfo.energy > 200
    },
    Transporter_Count_Threshold_Met: {
        name: "Transporter_Count_Threshold_Met",
        getCondition: (roomInfo) =>  roomInfo.transports >= 8
    },
    Transporter_Count_Threshold_Not_Met: {
        name: "Transporter_Count_Threshold_Not_Met",
        getCondition: (roomInfo) =>  roomInfo.transports < 8
    },
    Transporter_Energy_Cost: {
        name: "Transporter_Energy_Cost",
        getCondition: (roomInfo) =>  roomInfo.energy > 100
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