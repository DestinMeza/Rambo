const idleProcess = require("./idleProcess");
const spawnCreepProcess = require("./spawnCreepProcess");
const assignCreepTaskProcess = require("./assignTaskProcess");
const assignBuilderConstructionZone = require("./assignBuilderConstructionZone");

const generateBlueprintProcess = require("./generateBlueprintProcess");

const ROOM_CONDITIONS = require("./room_conditions");
const BELIEFS = require("./beliefs");

const Tasks = require("./tasks");

const ROOM_ACTIONS = {
    Idle: {
        name: "Idle",
        cost: 1.0,
        effects: [(worldSim) => {}],
        possibleActionChildren: ["NONE"],
        preConditions: [],
        postConditions: [],
        beliefs: [BELIEFS.Idle],
        getProcess: (self) => idleProcess(self),
        getStart: (self) => { 
            self.startTime = Game.time; 
            self.duration = 3;
        },
        getData: (roomInfo) => { }
    },
    Spawn_Worker_Creep: {
        name: "Spawn_Worker_Creep",
        cost: 1.0,
        effects: [(worldSim) => {
            worldSim.creepsAlive = worldSim.creepsAlive + 1;
        }],
        possibleActionChildren: [],
        preConditions: [ROOM_CONDITIONS.WorkerBody_Energy_Cost.name],
        postConditions: [
            ROOM_CONDITIONS.Spawning_Creep.name,
            ROOM_CONDITIONS.Spawning_Worker.name
        ],
        beliefs: [],
        getProcess: (self) => spawnCreepProcess(self),
        getStart: (self) => { self.startTime = Game.time; },
        getData: (roomInfo) => {
            return {
                creepName: "Worker " + roomInfo.randomNumber,
                spawnId: roomInfo.spawnId,
                requiredBodyParts: [WORK, CARRY, MOVE],
                possibleBodyParts: [WORK, CARRY, MOVE]
            }
        }
    },
    Spawn_Transport_Creep: {
        name: "Spawn_Transport_Creep",
        cost: 1.0,
        effects: [(worldSim) => {
            worldSim.creepsAlive = worldSim.creepsAlive + 1;
        }],
        possibleActionChildren: [],
        preConditions: [ROOM_CONDITIONS.TransporterBody_Energy_Cost.name],
        postConditions: [            
            ROOM_CONDITIONS.Spawning_Creep.name,
            ROOM_CONDITIONS.Spawning_Transport.name
        ],
        beliefs: [],
        getProcess: (self) => spawnCreepProcess(self),
        getStart: (self) => { self.startTime = Game.time; },
        getData: (roomInfo) => {
            return {
                creepName: "Transporter " + roomInfo.randomNumber,
                spawnId: roomInfo.spawnId,
                requiredBodyParts: [CARRY, MOVE, MOVE],
                possibleBodyParts: [CARRY, MOVE, MOVE]
            }
        }
    },
    Assign_Task_Upgrade: 
    {
        name: "Assign_Task_Upgrade",
        cost: 1.0,
        effects: [(worldSim) => {
        }],
        possibleActionChildren: ["Spawn_Worker_Creep"],
        preConditions: [
            ROOM_CONDITIONS.Spawning_Creep.name,
            ROOM_CONDITIONS.Spawning_Worker.name,
        ],
        postConditions: [],
        beliefs: [BELIEFS.Increase_Upgrade_Speed],
        getProcess: (self) => assignCreepTaskProcess(self),
        getStart: (self) => {},
        getData: (roomInfo) => {
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
        }],
        possibleActionChildren: ["Spawn_Worker_Creep"],
        preConditions: [
            ROOM_CONDITIONS.Harvester_Count_Threshold_Not_Met.name,
            ROOM_CONDITIONS.Spawning_Worker.name,
            ROOM_CONDITIONS.Spawning_Creep.name
        ],
        postConditions: [],
        beliefs: [BELIEFS.Increases_Energy_Collection],
        getProcess: (self) => assignCreepTaskProcess(self),
        getStart: (self) => {},
        getData: (roomInfo) => {
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
        }],
        possibleActionChildren: ["Spawn_Worker_Creep"],
        preConditions: [            
            ROOM_CONDITIONS.Spawning_Worker.name,
            ROOM_CONDITIONS.Spawning_Creep.name,
            ROOM_CONDITIONS.Room_Has_Blueprint.name
        ],
        postConditions: [],
        beliefs: [BELIEFS.Increase_Build_Speed],
        getProcess: (self) => assignCreepTaskProcess(self),
        getStart: (self) => {},
        getData: (roomInfo) => {
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
        possibleActionChildren: ["Spawn_Transport_Creep"],
        preConditions: [
            ROOM_CONDITIONS.Transporter_Count_Threshold_Not_Met.name,
            ROOM_CONDITIONS.Spawning_Transport.name,
            ROOM_CONDITIONS.Spawning_Creep.name
        ],
        postConditions: [],
        beliefs: [BELIEFS.Increase_Logistics_Speed],
        getProcess: (self) => assignCreepTaskProcess(self),
        getStart: (self) => {},
        getData: (roomInfo) => {
            return {
               task: Tasks.keys.Transport_Local
            } 
        }
    },
    Assign_Builder_ConstructionSite:
    {
        name: "Assign_Builder_ConstructionSite",
        cost: 1.0,
        effects: [(worldSim) => {
        }],
        possibleActionChildren: [],
        preConditions: [
            ROOM_CONDITIONS.Room_Builders_Need_Assignment.name,
        ],
        postConditions: [],
        beliefs: [BELIEFS.Resolve_Builder_Task],
        getProcess: (self) => assignBuilderConstructionZone(self),
        getStart: (self) => { },
        getData: (roomInfo) => { }
    },
    Assign_Room_Blueprint:
    {
        name: "Assign_Room_Blueprint",
        cost: 1.0,
        effects: [(worldSim) => {
        }],
        possibleActionChildren: [],
        preConditions: [
            ROOM_CONDITIONS.Room_Has_No_Blueprint.name,
        ],
        postConditions: [
            ROOM_CONDITIONS.Room_Has_Blueprint.name
        ],
        beliefs: [BELIEFS.Generate_Blueprint],
        getProcess: (self) => generateBlueprintProcess(self),
        getStart: (self) => { },
        getData: (roomInfo) => {
        }
    }
}

module.exports = ROOM_ACTIONS;