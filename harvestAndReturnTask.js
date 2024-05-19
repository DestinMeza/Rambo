const HARVESTER_STATE =
{
    NOTHING: 0,
    HARVESTING: 1,
    DEPOSITING: 2
}

function process(info) {
    switch(info.state)
    {
        case HARVESTER_STATE.NOTHING:
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
        info.state = HARVESTER_STATE.NOTHING;   
        return info;
    }

    let error = creep.harvest(source);

    if(error == ERR_NOT_IN_RANGE) {
        creep.moveTo(source);
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

    if(storage == null)
    {
        info.targetStorage = findStorage(info);
        return info;
    }

    let error = creep.transfer(storage, RESOURCE_ENERGY);

    if(error == ERR_NOT_IN_RANGE) {
        creep.moveTo(storage);
    }
    else if(creep.store.getUsedCapacity([RESOURCE_ENERGY]) == 0)
    {
        info.targetStorage = null;
        info.targetSource = findSource(info);
        info.state = info.targetSource == null ? HARVESTER_STATE.NOTHING : HARVESTER_STATE.HARVESTING
    }

    return info;
}

function findSource(info)
{
    const creep = Game.creeps[info.creep];
    const room = creep.room;

    let sources = room.find(FIND_SOURCES);

    sources = sources.sort(function(x, y)
    {
        return y.pos - x.pos;
    })

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