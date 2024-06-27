const ROOM_CONDITIONS = require("./room_conditions");
const BELIEFS = require("./beliefs");

const ROOM_GOALS = {
    Collect_Energy:
    {
        name: "Collect_Energy",
        getPriority: (roomInfo) => {
            let harvesterPriority = 2.0;

            if(roomInfo.sourceSaturation > 0 && roomInfo.harvesters.length > 0)
            {
                harvesterPriority = roomInfo.sourceSaturation / roomInfo.harvesters.length;
            }

            return harvesterPriority;
        },
        preConditions: [],
        postConditions: [],
        beliefs: [BELIEFS.Increases_Energy_Collection]
    },
    Improve_Logistics:
    {
        name: "Improve_Logistics",
        getPriority: (roomInfo) => roomInfo.harvesters.length / roomInfo.transports.length * 1.333,
        preConditions: [],
        postConditions: [],
        beliefs: [BELIEFS.Increase_Logistics_Speed]
    },
    Improve_Controller:
    {
        name: "Improve_Controller",
        getPriority: (roomInfo) => {
            let upgraderPriority = 0.0;

            let condition = ROOM_CONDITIONS.Upgrader_Count_Threshold_Met.getCondition(roomInfo);

            if(!condition && roomInfo.sourceSaturation > 0)
            {
                upgraderPriority = roomInfo.harvesters.length / roomInfo.sourceSaturation;
            }

            return upgraderPriority;
        },
        preConditions: [ROOM_CONDITIONS.Upgrader_Count_Threshold_Not_Met.name],
        postConditions: [],
        beliefs: [BELIEFS.Increase_Upgrade_Speed]
    },
    Improve_Build_Speed:
    {
        name: "Improve_Build_Speed",
        getPriority: (roomInfo) => {
            let builderPriority = 0.0;
            
            let condition = ROOM_CONDITIONS.Builder_Count_Threshold_Met.getCondition(roomInfo);

            if(!condition && roomInfo.sourceSaturation > 0)
            {
                builderPriority = roomInfo.harvesters.length / roomInfo.sourceSaturation;
            }

            return builderPriority;
        },
        preConditions: [ROOM_CONDITIONS.Builder_Count_Threshold_Not_Met.name],
        postConditions: [],
        beliefs: [BELIEFS.Increase_Build_Speed]
    },
    Create_Base:
    {
        name: "Create_Base",
        getPriority: (roomInfo) => 5.0,
        preConditions: [
            ROOM_CONDITIONS.Room_Has_No_Blueprint.name, 
            ROOM_CONDITIONS.Room_Is_Not_Ignore.name],
        postConditions: [],
        beliefs: [BELIEFS.Generate_Blueprint]
    },
    Resolve_Idle_Builder_Creeps:
    {
        name: "Resolve_Idle_Builder_Creeps",
        getPriority: (roomInfo) => 2.0,
        preConditions: [ROOM_CONDITIONS.Room_Builders_Need_Assignment.name],
        postConditions: [],
        beliefs: [BELIEFS.Resolve_Builder_Task]
    },
    Idle:
    {
        name: "Idle",
        getPriority: (roomInfo) => 1.0,
        preConditions: [],
        postConditions: [],
        beliefs: [BELIEFS.Idle]
    }
}

module.exports = ROOM_GOALS;