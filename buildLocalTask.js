const BUILDER_STATE =
{
    IDLE: 0,
    COLLECTING_STORE: 1,
    HARVESTING: 2,
    BUILDING: 3
}

function process(info) {
    switch(info.state)
    {
        case BUILDER_STATE.IDLE:
            info = idle(info);
            break;
        case BUILDER_STATE.COLLECTING_STORE:
            info = collecting_store(info);
            break;
        case BUILDER_STATE.HARVESTING:
            info = harvest(info);
            break;
        case BUILDER_STATE.BUILDING:
            info = build(info);
            break;
    }

    return info;
}

function idle(info) {
    const creep = Game.creeps[info.creep];

    if(creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0)
    {
        info.state = BUILDER_STATE.BUILDING;
        info.targetSource = null;
        return info;
    }

    const targetStorage = Game.getObjectById(info.targetStorage);

    if(targetStorage == null)
    {
        info.targetStorage = findStorage(info);

        if(info.targetStorage != null)
        {
            info.state = BUILDER_STATE.COLLECTING_STORE;
            return info;
        }

        //Find Source to get energy from.
        const source = Game.getObjectById(info.targetSource);

        if(source == null)
        {
            info.targetSource = findSource(info);
            
            if(info.targetSource != null)
            {
                info.state = BUILDER_STATE.HARVESTING;
                return info;
            }
        }
    }

    return info;
}

function collecting_store(info) {
    const creep = Game.creeps[info.creep];
    const targetStorage = Game.getObjectById(info.targetStorage);

    if(targetStorage == undefined)
    {
        info.targetSource = findSource(info);
        info.state = BUILDER_STATE.HARVESTING;
        return info;
    }

    let result = creep.withdraw(targetStorage, [RESOURCE_ENERGY]);

    if(result == ERR_NOT_IN_RANGE) {
        creep.moveTo(constructionSite);
    }
    else if(creep.store.getFreeCapacity(RESOURCE_ENERGY) <= 0)
    {
        info.state = BUILDER_STATE.BUILDING;
        info.targetStorage = null;
    }
    else
    {
        info.state = BUILDER_STATE.IDLE;
        info.targetStorage = null;
    }

    return info;
}

function harvest(info) {
    const creep = Game.creeps[info.creep];
    const source = Game.getObjectById(info.targetSource);

    if(creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0)
    {
        info.targetStorage = null;
        info.requestingSite = true;
        info.state = info.constructionSite == null ? BUILDER_STATE.IDLE : BUILDER_STATE.BUILDING;
        return info;
    }

    if(source == null)
    {
        info.state = BUILDER_STATE.IDLE;   
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
        info.state = BUILDER_STATE.BUILDING;
        info.requestingSite = true;
        info.targetSource = null;
    }

    return info;
}

function build(info)
{
    const creep = Game.creeps[info.creep];
    const constructionSite = Game.getObjectById(info.constructionSite);

    if(constructionSite == undefined)
    {
        info.constructionSite = null;
        info.requestingSite = true;
        info.state = BUILDER_STATE.IDLE;
        return info;
    }

    let result = creep.build(constructionSite);

    if(result == ERR_NOT_IN_RANGE) {
        creep.moveTo(constructionSite);
    }
    else if(creep.store.getUsedCapacity(RESOURCE_ENERGY) <= 0)
    {
        info.state = BUILDER_STATE.IDLE;
    }

    return info;
}

function findSource(info) {
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
        && !(structure instanceof StructureSpawn)
        && !(structure instanceof StructureExtension)
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