const HARVESTER_STATE =
{
    IDLE: 0,
    HARVESTING: 1,
    DEPOSITING: 2
}

function process(info) {
    switch(info.state)
    {
        case HARVESTER_STATE.IDLE:
            info = idle(info);
            break;
        case HARVESTER_STATE.HARVESTING:
            info = harvest(info);
            break;
        case HARVESTER_STATE.DEPOSITING:
            info = deposit(info);
            break;
    }

    return info;
}

function idle(info) {
    const source = Game.getObjectById(info.targetSource);

    if(source == null)
    {
        info.targetSource = findSource(info);
        return info;
    }

    info.state = HARVESTER_STATE.HARVESTING;

    return info;
}

function harvest(info) {
    const creep = Game.creeps[info.creep];
    const source = Game.getObjectById(info.targetSource);

    if(source == null)
    {
        info.state = HARVESTER_STATE.IDLE;   
        return info;
    }

    let result = creep.harvest(source);

    if(result == ERR_NOT_IN_RANGE) {
        result = creep.moveTo(source);
        if(result == ERR_NO_PATH)
        {
            info.targetSource = findSource(info);
        }
    }
    else if(creep.store.getFreeCapacity(RESOURCE_ENERGY) <= 0) {

        const hasTransporters = creep.room.find(FIND_MY_CREEPS, {filter: creep => {
            if(creep.memory.task == undefined)
            {
                return false;
            }

            return creep.memory.task.name == "Transport_Local";
        }}).length > 0;

        if(!hasTransporters)
        {
            info.state = HARVESTER_STATE.DEPOSITING;
            info.targetSource = null;
            info.targetStorage = findStorage(info);
        }
    }

    return info;
}

function deposit(info)
{
    const creep = Game.creeps[info.creep];
    let storage = Game.getObjectById(info.targetStorage);

    if(creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0)
    {
        info.targetStorage = null;
        info.targetSource = findSource(info);
        info.state = info.targetSource == null ? HARVESTER_STATE.IDLE : HARVESTER_STATE.HARVESTING
        return info;
    }

    if(storage == null)
    {
        info.targetStorage = findStorage(info);
        return info;
    }

    let result = creep.transfer(storage, RESOURCE_ENERGY);

    if(result == ERR_NOT_IN_RANGE) {
        creep.moveTo(storage);
    }

    return info;
}

function findSource(info)
{
    const creep = Game.creeps[info.creep];
    const room = creep.room;

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
                room.name
            );
        }

        return relativeDirectionsInGamePos;
    }

    let sources = room.find(FIND_SOURCES);

    sources = sources.filter(source => {
        const relativeArea = getRelativeArea(source.pos.x, source.pos.y);

        let freeSpaceCount = 0;
        let hasEnemy = false;

        for(const relativeKey in relativeArea)
        {
            const relativeSpace = relativeArea[relativeKey];

            let areaInfo = room.lookAt(relativeSpace);

            hasEnemy = areaInfo.filter(info => {
                return info.type == 'creep' && info.creep.owner.username == 'Source Keeper'
            }).length > 0;

            if(hasEnemy)
            {
                return false;   
            }

            const isOccupied = areaInfo.filter(info => {
                return info.type == 'creep';
            }).length > 0;

            if(isOccupied)
            {
                continue;
            }

            let spaceCount = areaInfo.filter(info => {
                return info.type == 'terrain' && info.terrain == 'plain'
            }).length > 0 ? 1 : 0;

            freeSpaceCount += spaceCount;
        }

        return freeSpaceCount > 0;
    })

    sources = sources.sort(function(x, y)
    {
        return y.pos - x.pos;
    })

    if(sources.length <= 0)
    {
        return null;   
    }

    return sources[0].id;
}

function findStorage(info)
{
    const creep = Game.creeps[info.creep];
    const room = creep.room;

    let structures = room.find(FIND_MY_STRUCTURES);

    let storedableStructures = structures.filter(structure => {
        return structure.store != undefined
    })

    storedableStructures = storedableStructures.filter(structure => {
        return structure.store.getFreeCapacity([RESOURCE_ENERGY]) > 0
    })

    if(storedableStructures.length <= 0)
    {
        return null;
    }

    storedableStructures = storedableStructures.sort(function(x, y)
    {
        return y.pos - x.pos;
    })


    return storedableStructures[0].id;
}

module.exports = process;