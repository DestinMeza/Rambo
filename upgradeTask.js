const UPGRADER_STATE =
{
    IDLE: 0,
    COLLECTING_STORE: 1,
    HARVESTING: 2,
    UPGRADING: 3
}

function process(info) {
    switch(info.state)
    {
        case UPGRADER_STATE.IDLE:
            info = idle(info);
            break;
        case UPGRADER_STATE.COLLECTING_STORE:
            info = collecting_store(info);
            break;
        case UPGRADER_STATE.HARVESTING:
            info = harvest(info);
            break;
        case UPGRADER_STATE.UPGRADING:
            info = upgrade(info);
            break;
    }

    return info;
}

function idle(info) {

    const targetStorage = Game.getObjectById(info.targetStorage);

    if(targetStorage == null)
    {
        info.targetStorage = findStorage(info);

        if(info.targetStorage != null)
        {
            info.state = UPGRADER_STATE.COLLECTING_STORE;
            return info;
        }

        //Find Source to get energy from.
        const source = Game.getObjectById(info.targetSource);

        if(source == null)
        {
            info.targetSource = findSource(info);
            
            if(info.targetSource != null)
            {
                info.state = UPGRADER_STATE.HARVESTING;
                return info;
            }
        }
    }

    return info;
}

function collecting_store(info) {
    const targetStorage = Game.getObjectById(info.targetStorage);

    if(targetStorage == undefined)
    {
        info.targetSource = findSource(info);
        info.state = UPGRADER_STATE.HARVESTING;
        return info;
    }

    let result = creep.withdraw(targetStorage, [RESOURCE_ENERGY]);

    if(result == ERR_NOT_IN_RANGE) {
        creep.moveTo(roomController);
    }
    else if(creep.store.getFreeCapacity(RESOURCE_ENERGY) <= 0)
    {
        info.state = UPGRADER_STATE.UPGRADING;
        info.targetStorage = null;
    }
    else
    {
        info.state = UPGRADER_STATE.IDLE;
        info.targetStorage = null;
    }

    return info;
}

function harvest(info) {
    const creep = Game.creeps[info.creep];
    const source = Game.getObjectById(info.targetSource);

    if(source == null)
    {
        info.state = UPGRADER_STATE.IDLE;   
        return info;
    }

    let result = creep.harvest(source);

    if(result == ERR_NOT_IN_RANGE) {
        creep.moveTo(source);
    }
    else if(creep.store.getFreeCapacity(RESOURCE_ENERGY) <= 0) {
        info.state = UPGRADER_STATE.UPGRADING;
        info.targetSource = null;
    }

    return info;
}

function upgrade(info)
{
    const creep = Game.creeps[info.creep];
    const roomController = Game.getObjectById(info.roomController);

    let result = creep.upgradeController(roomController);

    if(result == ERR_NOT_IN_RANGE) {
        creep.moveTo(roomController);
    }
    else if(creep.store.getUsedCapacity(RESOURCE_ENERGY) <= 0)
    {
        info.state = UPGRADER_STATE.IDLE;
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