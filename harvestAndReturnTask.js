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
        info.state = HARVESTER_STATE.DEPOSITING;
        info.targetSource = null;
        info.targetStorage = findStorage(info);
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

    let sources = room.find(FIND_SOURCES);

    sources = sources.filter(source => {
        let pos = source.pos;
        let creeps = source.room.lookForAtArea(LOOK_CREEPS, pos.y - 1, pos.x - 1, pos.y + 1, pos.x + 1, true);

        for(const creep in creeps)
        {
            const creepInfo = creeps[creep];
            const creepObj = Game.getObjectById(creepInfo.id);

            //Enemy Creep found
            if(creepObj == undefined)
            {
                return false;   
            }
            
            if(creepObj.store.getUsedCapacity(RESOURCE_ENERGY) / creepObj.store.getCapacity(RESOURCE_ENERGY) >= 0.7)
            {
                return false;
            }
        }

        return true;
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