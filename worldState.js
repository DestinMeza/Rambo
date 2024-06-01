const Condition = require("./condition");
const Action = require("./action");
const Goal = require("./goal");
const Tasks = require("./tasks");

const placeConstructionProcess = require("./placeConstructionProcess");

//-------- GOAP MODULES

const ROOM_ACTIONS = require("./room_actions");
const ROOM_GOALS = require("./room_goals");
const ROOM_CONDITIONS = require("./room_conditions");

//--------

let instance;

class WorldState
{
    constructor()
    {
        if (instance) {
            return;
        }

        instance = this;

        this.randomNumber = Math.floor(Math.random() * 10000);
        this.global = {
            conditions: []
        }
        
        this.rooms = [];

        //Room Data initalization
        for(const roomKey in Game.rooms)
        {
            this.rooms[roomKey] = registerRoom(roomKey);
        }
    }

    static process()
    {
        this.randomNumber = Math.floor(Math.random() * 10000);

        for(const roomKey in Game.rooms)
        {
            updateRoom(roomKey);
        }

        //TODO setup global object
        //This is useful for having a place for global states that are helpful for the Bot.
        this.global = {}
    }

    static getInstance()
    {
        return instance;
    }

    getGoals()
    {
        let goals = [];

        for(const roomKey in Game.rooms)
        {
            const roomInfo = this.rooms[roomKey];

            if(!roomInfo.goals)
            {
                continue;
            }

            for(const goalKey in roomInfo.goals)
            {
                const action = roomInfo.goals[goalKey];

                goals.push(action);
            }
        }

        return goals;
    }

    getActions()
    {
        let actions = [];

        for(const roomKey in Game.rooms)
        {
            const roomInfo = this.rooms[roomKey];

            if(!roomInfo.actions)
            {
                continue;
            }

            for(const actionKey in roomInfo.actions)
            {
                const action = roomInfo.actions[actionKey];

                actions.push(action);
            }
        }

        return actions;
    }

    getConditions()
    {
        let conditions = [];

        for(const roomKey in Game.rooms)
        {
            const roomInfo = this.rooms[roomKey];

            if(!roomInfo.conditions)
            {
                continue;
            }

            for(const conditionKey in roomInfo.conditions)
            {
                const condition = roomInfo.conditions[conditionKey];

                conditions.push(condition);
            }
        }

        return conditions;
    }

    simulateStateChange(effects)
    {
        effects.forEach(effect => {
            effect(this);
        });
    }
}

function updateRoom(roomKey)
{
    const roomInfo = instance.rooms[roomKey];

    roomInfo.my = roomInfo.room.controller.my;
    if(roomInfo.my)
    {
        roomInfo.conditions = getRoomConditions(roomKey);
    }
}

function registerRoom(roomKey)
{
    const room = Game.rooms[roomKey];

    instance.rooms[roomKey] = {};

    let roomInfo = instance.rooms[roomKey];

    roomInfo.name = roomKey;
    roomInfo.room = room;
    roomInfo.my = room.controller.my;

    if(roomInfo.my)
    {
        roomInfo = setOwnedRoom(roomKey);
    }
    else
    {
        roomInfo = setNotOwnedRooms(roomKey);
    }

    return roomInfo;
}

function setOwnedRoom(roomKey)
{
    let roomInfo = instance.rooms[roomKey];

    roomInfo.controller = roomInfo.room.controller;
    roomInfo.stores = getRoomStorages(roomKey);
    roomInfo.constructionSites = getConstructionSites(roomKey);
    roomInfo.energy = getEnergy(roomKey);
    roomInfo.energyCapacity = getEnergyCapacity(roomKey);
    roomInfo.capacityRatio = roomInfo.energy / roomInfo.energyCapacity;
    roomInfo.creeps = getRoomCreeps(roomKey);
    roomInfo.harvesters = getCreepsWithTaskFilter(roomKey, Tasks.keys.Harvest_Return_Local);
    roomInfo.builders =  getCreepsWithTaskFilter(roomKey, Tasks.keys.Build_Local);
    roomInfo.transports = getCreepsWithTaskFilter(roomKey, Tasks.keys.Transport_Local);
    roomInfo.upgraders = getCreepsWithTaskFilter(roomKey, Tasks.keys.Upgrade_Local);
    roomInfo.conditions = getRoomConditions(roomKey);
    roomInfo.actions = getOwnedRoomActions(roomKey);
    roomInfo.goals = getRoomGoals(roomKey);
    roomInfo.blueprint = roomInfo.room.memory.blueprint;

    return roomInfo;
}

function setNotOwnedRooms(roomKey)
{
    //TODO get room data.
    return null;
}

function getOwnedRoomActions(roomKey)
{
    let spawnActions = getSpawnActions(roomKey);

    let actions = {};

    for(const spawnActionKey in spawnActions)
    {
        actions[spawnActionKey] = spawnActions[spawnActionKey];    
    }

    createAction(actions, {
        name: "Place_Construction",
        room: roomKey,
        cost: 1.0,
        effects: [(worldSim) => {
        }],
        process: (self) => placeConstructionProcess(self),
        start: (self) => { }
    });

    return actions;
}

function getRoomGoals(roomKey)
{
    const roomInfo = instance.rooms[roomKey];

    let roomGoals = {}

    const PRIORITES = 
    {
        [ROOM_GOALS.Collect_Energy.name]: { 
            name: "collectEnergyPriority",
            value: roomInfo.capacityRatio,
        }
    }

    for(const KEY in ROOM_GOALS)
    {
        const goalInfo = ROOM_GOALS[KEY];

        createGoal(roomGoals, {
            name: goalInfo.name,
            priority: goalInfo.getPriority(PRIORITES[KEY].value),
            preConditions: goalInfo.preConditions,
            postConditions: goalInfo.postConditions
        });
    }

    return roomGoals;
}

function getSpawnActions(roomKey)
{
    const room = Game.rooms[roomKey];

    let spawns = room.find(FIND_STRUCTURES, {filter: structure => {
        return structure.structureType == STRUCTURE_SPAWN && !structure.spawning;
    }})

    if(spawns.length == 0)
    {
        return {};   
    }

    let spawnActions = {};

    const ACTION_DATA = 
    {
        [ROOM_ACTIONS.Spawn_Worker_Creep.name]: { 
            randomNumber: instance.randomNumber,
            spawnId: spawns[0].id,
        }
    }

    for(const KEY in ROOM_ACTIONS)
    {
        const actionInfo = ROOM_ACTIONS[KEY];

        createAction(spawnActions, {
            name: actionInfo.name,
            room: roomKey,
            cost: actionInfo.cost,
            effects: actionInfo.effects,
            preConditions: actionInfo.preConditions,
            postConditions: actionInfo.postConditions,
            process: (self) => actionInfo.getProcess(self),
            start: (self) => actionInfo.getStart(self),
            data: actionInfo.getData(ACTION_DATA[KEY])
        })
    }

    return spawnActions;
}

function createAction(map, info)
{
    let action = new Action({
        name: info.name,
        cost: info.cost,
        room: info.room,
        effects: info.effects,
        process: info.process,
        start: info.start,
        preConditions: info.preConditions,
        postConditions: info.postConditions,
        data: info.data,
        getPreConditions: function()
        {
            let preconditions = [];
    
            const conditions = this.room ? instance.rooms[this.room].conditions : instance.global.conditions;
    
            for(let i = 0; i < this.preConditions.length; i++)
            {
                const foundCondition = conditions[this.preConditions[i]];
    
                preconditions.push(foundCondition);
            }
    
            return preconditions;
        },
        getPostConditions: function()
        {
            let postConditions = [];

            const conditions = this.room ? instance.rooms[this.room].conditions : instance.global.conditions;

            for(let i = 0; i < this.postConditions.length; i++)
            {
                const foundCondition = conditions[this.postConditions[i]];

                postConditions.push(foundCondition);
            }

            return postConditions;
        }
    })

    map[info.name] = action;
}

function createGoal(map, info)
{
    let goal = new Goal({
        name: info.name,
        priority: info.priority,
        preConditions: info.preConditions,
        postConditions: info.postConditions,
        getPreConditions: function()
        {
            let preconditions = [];
            
            const conditions = this.room ? instance.rooms[this.room].conditions : instance.global.conditions;

            for(let i = 0; i < this.preConditions.length; i++)
            {
                const foundCondition = conditions[this.preConditions[i]];
    
                preconditions.push(foundCondition);
            }
    
            return preconditions;
        },
        getPostConditions: function()
        {
            let postConditions = [];

            const conditions = this.room ? instance.rooms[this.room].conditions : instance.global.conditions;

            for(let i = 0; i < this.postConditions.length; i++)
            {
                const foundCondition = conditions[this.postConditions[i]];

                postConditions.push(foundCondition);
            }

            return postConditions;
        }
    })

    map[info.name] = goal;
}

function createCondition(map, info)
{
    let condition = new Condition({
        name: info.name,
        condition: info.condition
    })

    map[info.name] = condition;
}

function getRoomStorages(roomKey)
{
    const room = Game.rooms[roomKey];
    let storages = room.find(FIND_STRUCTURES, {filter: function(object){
        return object.store != undefined;
    }})

    return storages;
}

function getConstructionSites(roomKey)
{
    const room = Game.rooms[roomKey];
    let constructionSites = room.find(FIND_MY_CONSTRUCTION_SITES);
    return constructionSites;
}

function getEnergy(roomKey)
{
    const storages = getRoomStorages(roomKey);
    
    let energy = 0;

    for(const storage in storages)
    {
        energy += storages[storage][RESOURCE_ENERGY];
    }

    return energy;
}

function getEnergyCapacity(roomKey)
{
    const storages = getRoomStorages(roomKey);
    
    let energy = 0;

    for(const storageKey in storages)
    {
        const storage = storages[storageKey];

        energy += storage.store.getCapacity(RESOURCE_ENERGY);
    }

    return energy;
}

function getRoomCreeps(roomKey)
{
    let creeps = [];
    for(const creep in Game.creeps)
    {
        const creepObj = Game.creeps[creep];
        if(creepObj.memory.originRoom == roomKey)
        {
            creeps.push(creep);
        }
    }

    return creeps;
}

function getCreepsWithTaskFilter(roomKey, taskName)
{
    let creeps = getRoomCreeps(roomKey);

    creeps = creeps.filter(creep => {
        return Game.creeps[creep].memory.task == taskName;
    })

    return creeps;
}

function getRoomConditions(roomKey)
{
    const roomInfo = instance.rooms[roomKey];

    let conditions = {}

    for(const KEY in ROOM_CONDITIONS)
    {
        const conditionInfo = ROOM_CONDITIONS[KEY];

        createCondition(conditions, {
            name: conditionInfo.name,
            condition: conditionInfo.getCondition(roomInfo)
        })
    }

    return conditions;
}

module.exports = WorldState;