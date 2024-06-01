const spawnCreepProcess = require("./spawnCreepProcess");
const assignCreepTaskProcess = require("./assignTaskProcess");
const Task = require("./task");
const Tasks = require("./tasks");

const ROOM_ACTIONS = {
    Spawn_Worker_Creep: {
        name: "Spawn_Worker_Creep",
        cost: 1.0,
        effects: [(worldSim) => {
            worldSim.creepsAlive = worldSim.creepsAlive + 1;
        }],
        preConditions: [],
        postConditions: [],
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
        preConditions: [],
        postConditions: [],
        getProcess: (self) => assignCreepTaskProcess(self),
        getStart: (self) => { self.task = createTask({
            name: Tasks.keys.Upgrade_Local,
            creep: self.creep,
            data: self.data
        });},
        getData: (info) => {}
    },
    Assign_Task_Harvest_Return_Local: 
    {
        name: "Assign_Task_Harvest_Return_Local",
        cost: 1.0,
        effects: [(worldSim) => {
            worldSim.harvesters = worldSim.harvesters + 1;
        }],
        preConditions: [],
        postConditions: [],
        getProcess: (self) => assignCreepTaskProcess(self),
        getStart: (self) => { self.task = createTask({
            name: Tasks.keys.Harvest_Return_Local,
            creep: self.creep,
            data: self.data
        });},
        getData: (info) => {}
    },
    Assign_Task_Build_Local: 
    {
        name: "Assign_Task_Build_Local",
        cost: 1.0,
        effects: [(worldSim) => {
            worldSim.builders = worldSim.builders + 1;
        }],
        preConditions: [],
        postConditions: [],
        getProcess: (self) => assignCreepTaskProcess(self),
        getStart: (self) => { self.task = createTask({
            name: Tasks.keys.Build_Local,
            creep: self.creep,
            data: self.data
        });},
        getData: (info) => {}
    },
    Assign_Task_Transport_Local: 
    {
        name: "Assign_Task_Transport_Local",
        cost: 1.0,
        effects: [(worldSim) => {
            worldSim.transports = worldSim.transports + 1;
        }],
        preConditions: [],
        postConditions: [],
        getProcess: (self) => assignCreepTaskProcess(self),
        getStart: (self) => { self.task = createTask({
            name: Tasks.keys.Transport_Local,
            creep: self.creep,
            data: self.data
        });},
        getData: (info) => {}
    },
}

function createTask(info)
{
    let task = new Task({
        name: info.task,
        creep: info.creep,
        data: info.data
    });

    return task;
}

module.exports = ROOM_ACTIONS;