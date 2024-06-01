const spawnCreepProcess = require("./spawnCreepProcess");
const assignCreepTaskProcess = require("./assignTaskProcess");

const ROOM_CONDITIONS = require("./room_conditions");

const Tasks = require("./tasks");

const ROOM_ACTIONS = {
    Spawn_Worker_Creep: {
        name: "Spawn_Worker_Creep",
        cost: 1.0,
        effects: [(worldSim) => {
            worldSim.creepsAlive = worldSim.creepsAlive + 1;
        }],
        possibleActionChildren: [],
        preConditions: [],
        postConditions: [ROOM_CONDITIONS.Spawning_Creep.name],
        getProcess: (self) => spawnCreepProcess(self),
        getStart: (self) => { self.startTime = Game.time; },
        getData: (info) => {
            return {
                creepName: "Worker " + info.randomNumber,
                spawnId: info.spawnId,
                requiredBodyParts: [WORK, CARRY, MOVE],
                possibleBodyParts: [WORK, CARRY, MOVE]
            }
        }
    },
    Assign_Task_Upgrade: 
    {
        name: "Assign_Task_Upgrade",
        cost: 1.0,
        effects: [(worldSim) => {
            worldSim.upgraders = worldSim.upgraders + 1;
        }],
        possibleActionChildren: ["Spawn_Worker_Creep"],
        preConditions: [],
        postConditions: [],
        getProcess: (self) => assignCreepTaskProcess(self),
        getStart: (self) => {},
        getData: (info) => {
            return {
               task: Tasks.keys.Upgrade_Local
            } 
        }
    },
    Assign_Task_Harvest_Return_Local: 
    {
        name: "Assign_Task_Harvest_Return_Local",
        cost: 1.0,
        effects: [(worldSim) => {
            worldSim.harvesters = worldSim.harvesters + 1;
        }],
        possibleActionChildren: ["Spawn_Worker_Creep"],
        preConditions: [
            ROOM_CONDITIONS.Harvester_Count_Threshold_Not_Met.name, 
            ROOM_CONDITIONS.Spawning_Creep.name
        ],
        postConditions: [ROOM_CONDITIONS.Energy_At_MaxCapacity.name],
        getProcess: (self) => assignCreepTaskProcess(self),
        getStart: (self) => {},
        getData: (info) => {
            return {
               task: Tasks.keys.Harvest_Return_Local
            } 
        }
    },
    Assign_Task_Build_Local: 
    {
        name: "Assign_Task_Build_Local",
        cost: 1.0,
        effects: [(worldSim) => {
            worldSim.builders = worldSim.builders + 1;
        }],
        possibleActionChildren: ["Spawn_Worker_Creep"],
        preConditions: [],
        postConditions: [],
        getProcess: (self) => assignCreepTaskProcess(self),
        getStart: (self) => {},
        getData: (info) => {
            return {
               task: Tasks.keys.Build_Local
            } 
        }
    },
    Assign_Task_Transport_Local: 
    {
        name: "Assign_Task_Transport_Local",
        cost: 1.0,
        effects: [(worldSim) => {
            worldSim.transports = worldSim.transports + 1;
        }],
        possibleActionChildren: ["Spawn_Worker_Creep"],
        preConditions: [],
        postConditions: [],
        getProcess: (self) => assignCreepTaskProcess(self),
        getStart: (self) => {},
        getData: (info) => {
            return {
               task: Tasks.keys.Transport_Local
            } 
        }
    },
}

module.exports = ROOM_ACTIONS;