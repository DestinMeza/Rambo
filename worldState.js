const Condition = require("./condition");
const Action = require("./action");
const Goal = require("./goal");
const Tasks = require("./tasks");

//-------- GOAP MODULES

const ROOM_ACTIONS = require("./room_actions");
const ROOM_GOALS = require("./room_goals");
const ROOM_CONDITIONS = require("./room_conditions");
const Plan = require("./plan");

//--------

class WorldState
{
    constructor()
    {
        this.randomNumber = Math.floor(Math.random() * 10000);
        this.global = {
            conditions: []
        }
        
        this.rooms = [];

        //Room Data initalization
        for(const roomKey in Game.rooms)
        {
            this.rooms[roomKey] = this.registerRoom(roomKey);
        }
    }

    process()
    {
        this.randomNumber = Math.floor(Math.random() * 10000);

        for(const roomKey in Game.rooms)
        {
            this.updateRoom(roomKey);
        }

        //TODO setup global object
        //This is useful for having a place for global states that are helpful for the Bot.
        this.global = {
            conditions: []
        }
    }

    loadSavedPlans()
    {
        const savedCommander = Memory.Commander;

        if (savedCommander == undefined) {
            return null;   
        }
        if (Memory.Commander.plans == undefined)
        {
            return null;   
        }

        let plans = [];

        for(const planKey in savedCommander.plans)
        {
            const plan = savedCommander.plans[planKey];

            let actions = [];

            for(const actionKey in plan.actions)
            {
                const actionSaveInfo = plan.actions[actionKey];

                let action = this.createActionFromSave(actionSaveInfo);

                actions.push(action);
            }

            let newPlan = new Plan({
                name: plan.name,
                actions: actions,
                actionIndex: plan.actionIndex
            });

            plans.push(newPlan);
        }

        return plans;
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

    //TODO readd this back. to ensure we are evaluating action effects to the world state.
    // simulateStateChange(effects)
    // {
    //     effects.forEach(effect => {
    //         effect(this);
    //     });
    // }
    
    updateRoom(roomKey)
    {
        const roomInfo = this.rooms[roomKey];

        roomInfo.my = roomInfo.room.controller.my;
        if(roomInfo.my == true)
        {
            roomInfo.randomNumber = this.randomNumber;
            roomInfo.stores = this.getRoomStorages(roomKey);
            roomInfo.constructionSites = this.getConstructionSites(roomKey);
            roomInfo.sourceSaturation = this.getRoomSourceSaturation(roomKey);
            roomInfo.energy = this.getEnergy(roomKey);
            roomInfo.energyCapacity = this.getEnergyCapacity(roomKey);
            roomInfo.capacityRatio = roomInfo.energy / roomInfo.energyCapacity;
            roomInfo.creeps = this.getRoomCreeps(roomKey);
            roomInfo.harvesters = this.getCreepsWithTaskFilter(roomKey, Tasks.keys.Harvest_Return_Local);
            roomInfo.builders =  this.getCreepsWithTaskFilter(roomKey, Tasks.keys.Build_Local);
            roomInfo.transports = this.getCreepsWithTaskFilter(roomKey, Tasks.keys.Transport_Local);
            roomInfo.upgraders = this.getCreepsWithTaskFilter(roomKey, Tasks.keys.Upgrade_Local);
            roomInfo.conditions = this.getRoomConditions(roomKey);
            roomInfo.actions = this.getOwnedRoomActions(roomKey);
            roomInfo.goals = this.getRoomGoals(roomKey);
            roomInfo.blueprint = roomInfo.room.memory.blueprint;

        }
    }

    registerRoom(roomKey)
    {
        const room = Game.rooms[roomKey];
        this.rooms[roomKey] = {};

        let roomInfo = this.rooms[roomKey];

        roomInfo.name = roomKey;
        roomInfo.room = room;

        if(room.controller)
        {
            roomInfo.my = room.controller.my;
        }
        else
        {
            roomInfo.my = false;
        }

        if(roomInfo.my)
        {
            roomInfo = this.setOwnedRoom(roomKey);
        }
        else
        {
            roomInfo = this.setNotOwnedRooms(roomKey);
        }

        return roomInfo;
    }

    setOwnedRoom(roomKey)
    {
        let roomInfo = this.rooms[roomKey];

        roomInfo.randomNumber = this.randomNumber;
        roomInfo.controller = roomInfo.room.controller;
        roomInfo.stores = this.getRoomStorages(roomKey);
        roomInfo.constructionSites = this.getConstructionSites(roomKey);
        roomInfo.sourceSaturation = this.getRoomSourceSaturation(roomKey);
        roomInfo.energy = this.getEnergy(roomKey);
        roomInfo.energyCapacity = this.getEnergyCapacity(roomKey);
        roomInfo.capacityRatio = roomInfo.energy / roomInfo.energyCapacity;
        roomInfo.creeps = this.getRoomCreeps(roomKey);
        roomInfo.harvesters = this.getCreepsWithTaskFilter(roomKey, Tasks.keys.Harvest_Return_Local);
        roomInfo.builders =  this.getCreepsWithTaskFilter(roomKey, Tasks.keys.Build_Local);
        roomInfo.transports = this.getCreepsWithTaskFilter(roomKey, Tasks.keys.Transport_Local);
        roomInfo.upgraders = this.getCreepsWithTaskFilter(roomKey, Tasks.keys.Upgrade_Local);
        roomInfo.conditions = this.getRoomConditions(roomKey);
        roomInfo.actions = this.getOwnedRoomActions(roomKey);
        roomInfo.goals = this.getRoomGoals(roomKey);
        roomInfo.blueprint = roomInfo.room.memory.blueprint;

        return roomInfo;
    }

    setNotOwnedRooms(roomKey)
    {
        let roomInfo = this.rooms[roomKey];
        
        //TODO get room data
        return roomInfo;
    }

    getOwnedRoomActions(roomKey)
    {
        let spawnActions = this.getSpawnActions(roomKey);

        let actions = {};

        for(const spawnActionKey in spawnActions)
        {
            actions[spawnActionKey] = spawnActions[spawnActionKey];    
        }

        return actions;
    }

    getRoomGoals(roomKey)
    {
        const roomInfo = this.rooms[roomKey];

        let roomGoals = {}

        for(const KEY in ROOM_GOALS)
        {
            const goalInfo = ROOM_GOALS[KEY];

            this.createGoalWithMap(roomGoals, {
                name: goalInfo.name,
                room: roomKey,
                priority: goalInfo.getPriority(roomInfo),
                preConditions: goalInfo.preConditions,
                postConditions: goalInfo.postConditions,
                beliefs: goalInfo.beliefs,
            });
        }

        return roomGoals;
    }

    getSpawnActions(roomKey)
    {
        const roomInfo = this.rooms[roomKey];
        const room = Game.rooms[roomKey];

        let spawns = room.find(FIND_STRUCTURES, {filter: structure => {
            return structure.structureType == STRUCTURE_SPAWN && !structure.spawning;
        }})

        if(spawns.length == 0)
        {
            return {};   
        }

        let spawnActions = {};

        roomInfo.spawnId = spawns[0].id;

        for(const KEY in ROOM_ACTIONS)
        {
            const actionInfo = ROOM_ACTIONS[KEY];

            this.createActionWithMap(spawnActions, {
                name: actionInfo.name,
                room: roomKey,
                cost: actionInfo.cost,
                effects: actionInfo.effects,
                preConditions: actionInfo.preConditions,
                postConditions: actionInfo.postConditions,
                possibleActionChildren: actionInfo.possibleActionChildren,
                beliefs: actionInfo.beliefs,
                process: (self) => actionInfo.getProcess(self),
                start: (self) => actionInfo.getStart(self),
                data: actionInfo.getData(roomInfo)
            })
        }

        return spawnActions;
    }

    createActionWithMap(map, info)
    {
        map[info.name] = this.createAction(info);
    }

    createAction(info)
    {
        const instance = this;

        let action = new Action({
            name: info.name,
            cost: info.cost,
            room: info.room,
            effects: info.effects,
            process: info.process,
            start: info.start,
            possibleActionChildren: info.possibleActionChildren,
            preConditions: info.preConditions,
            postConditions: info.postConditions,
            beliefs: info.beliefs,
            data: info.data,
            getPreConditions: function()
            {
                let preConditions = [];
        
                const conditions = this.room ? instance.rooms[this.room].conditions : instance.global.conditions;
        
                for(let i = 0; i < this.preConditions.length; i++)
                {
                    const foundCondition = conditions[this.preConditions[i]];
        
                    preConditions.push(foundCondition);
                }
        
                return preConditions;
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

        return action;
    }

    createActionFromSave(saveInfo)
    {
        const KEY = saveInfo.name;
        const actionInfo = ROOM_ACTIONS[KEY];

        const propertyBlacklist = [
            "getProcess",
            "getStart",
            "getData"
        ];

        let actionData = {}

        // Set dynamic object info.
        for(const key in saveInfo)
        {
            if(propertyBlacklist.includes(key))
            {
                continue;   
            }

            const propertyValue = actionInfo[key];

            if(propertyValue == undefined)
            {
                actionData[key] = saveInfo[key];
            }
        }

        return this.createAction({
            name: KEY,
            room: saveInfo.room,
            cost: saveInfo.cost,
            effects: actionInfo.effects,
            preConditions: saveInfo.preConditions,
            postConditions: saveInfo.postConditions,
            beliefs: saveInfo.beliefs,
            process: (self) => actionInfo.getProcess(self),
            start: (self) => actionInfo.getStart(self),
            data: actionData
        })
    }

    createGoalWithMap(map, info)
    {
        map[info.name] = this.createGoal(info);
    }

    createGoal(info)
    {
        const instance = this;

        let goal = new Goal({
            name: info.name,
            room: info.room,
            priority: info.priority,
            preConditions: info.preConditions,
            postConditions: info.postConditions,
            beliefs: info.beliefs,
            getPreConditions: function()
            {
                let preConditions = [];
                
                const conditions = this.room ? instance.rooms[this.room].conditions : instance.global.conditions;

                for(let i = 0; i < this.preConditions.length; i++)
                {
                    const foundCondition = conditions[this.preConditions[i]];
        
                    preConditions.push(foundCondition);
                }
        
                return preConditions;
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

        return goal;
    }

    createConditionWithMap(map, info)
    {
        map[info.name] = this.createCondition(info);
    }

    createCondition(info)
    {
        let condition = new Condition({
            name: info.name,
            condition: info.condition
        })

        return condition;
    }

    getRoomStorages(roomKey)
    {
        const room = Game.rooms[roomKey];
        let storages = room.find(FIND_STRUCTURES, {filter: function(object){
            return object.store != undefined;
        }})

        return storages;
    }

    getConstructionSites(roomKey)
    {
        const room = Game.rooms[roomKey];
        let constructionSites = room.find(FIND_MY_CONSTRUCTION_SITES);
        return constructionSites;
    }

    getEnergy(roomKey)
    {
        const storages = this.getRoomStorages(roomKey);
        
        let energy = 0;

        for(const storage in storages)
        {
            energy += storages[storage][RESOURCE_ENERGY];
        }

        return energy;
    }

    getRoomSourceSaturation(roomKey)
    {
        const room = Game.rooms[roomKey];

        let saturation = 0;

        const getRelativeArea = function(x, y) {
            const directions = {
                topRight:    { x:  1, y: -1},
                top:         { x:  0, y: -1},
                topLeft:     { x: -1, y: -1},
                left:        { x: -1, y:  0},
                bottomLeft:  { x: -1, y:  1},
                bottom:      { x:  0, y:  1},
                bottomRight: { x:  1, y:  1},
                right:       { x:  1, y:  0},
            }

            let relativeDirections = {};
            let relativeDirectionsInGamePos = {};

            for(const directionKey in directions)
            {
                const direction = directions[directionKey];

                //Ensure keys stay in bounds 0-49
                relativeDirections[directionKey] = {
                    x: Math.max(x + direction.x, 0), 
                    y:  Math.min(y + direction.y, 49)
                };

                relativeDirectionsInGamePos[directionKey] = new RoomPosition(
                    relativeDirections[directionKey].x, 
                    relativeDirections[directionKey].y, 
                    roomKey
                );
            }

            return relativeDirectionsInGamePos;
        }

        const sources = room.find(FIND_SOURCES);

        for(const sourceKey in sources)
        {
            let saturationToAdd = 0;
            const source = sources[sourceKey];
            const relativeArea = getRelativeArea(source.pos.x, source.pos.y);

            for(const relativeKey in relativeArea)
            {
                const relativeSpace = relativeArea[relativeKey];

                let areaInfo = room.lookAt(relativeSpace);

                let hasSourceKeeper = areaInfo.filter(info => {
                    return info.type == 'creep' && info.creep.owner.username == 'Source Keeper';
                }).length > 0;

                if(hasSourceKeeper)
                {
                    saturationToAdd = 0;
                    break;
                }

                areaInfo = areaInfo.filter(info => {
                    return info.type == 'terrain' && info.terrain == 'plain'
                })
    
                saturationToAdd += areaInfo.length;
            }
            saturation += saturationToAdd;
        }

        return saturation;
    }

    getEnergyCapacity(roomKey)
    {
        const storages = this.getRoomStorages(roomKey);
        
        let energy = 0;

        for(const storageKey in storages)
        {
            const storage = storages[storageKey];

            energy += storage.store.getCapacity(RESOURCE_ENERGY);
        }

        return energy;
    }

    getRoomCreeps(roomKey)
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

    getCreepsWithTaskFilter(roomKey, task)
    {
        let creeps = this.getRoomCreeps(roomKey);

        creeps = creeps.filter(creep => {
            const creepObj = Game.creeps[creep];

            if(creepObj.memory.task == undefined)
            {
                return false;   
            }

            return creepObj.memory.task.name == task;
        })

        return creeps;
    }

    getRoomConditions(roomKey)
    {
        const roomInfo = this.rooms[roomKey];

        let conditions = {}

        for(const KEY in ROOM_CONDITIONS)
        {
            const conditionInfo = ROOM_CONDITIONS[KEY];

            this.createConditionWithMap(conditions, {
                name: conditionInfo.name,
                condition: conditionInfo.getCondition(roomInfo)
            })
        }

        return conditions;
    }
}

module.exports = WorldState;