const TRANSPORTER_STATE =
{
    IDLE: 0,
    WITHDRAWING: 1,
    DEPOSITING: 2,
}

const functionalBuildingsPriority = 
{
    [STRUCTURE_TOWER]: 0,
    [STRUCTURE_SPAWN]: 1,
    [STRUCTURE_EXTENSION]: 2,
}

const functionalBuildings = [
    STRUCTURE_TOWER,
    STRUCTURE_SPAWN,
    STRUCTURE_EXTENSION
];

const creepsWhoNeedEnergy = [
    "Upgrade",
    "Build Local"
];

function process(info) {
    switch(info.state)
    {
        case TRANSPORTER_STATE.IDLE:
            info = idle(info);
            break;
        case TRANSPORTER_STATE.WITHDRAWING:
            info = withdraw(info);
            break;
        case TRANSPORTER_STATE.DEPOSITING:
            info = deposit(info);
            break;
    }

    return info;
}

function idle(info) {
    const creep = Game.creeps[info.creep];

    if (creep.store.getFreeCapacity(RESOURCE_ENERGY) <= 0) 
    {
        info.targetDeposit = findDepositable(info);
        info.state = TRANSPORTER_STATE.DEPOSITING;
        return info;
    }

    const targetWithdraw = Game.getObjectById(info.targetWithdraw);


    if (targetWithdraw == null)
    {
        info.targetWithdraw = findWithdrawable(info);

        if(info.targetWithdraw != null)
        {
            info.state = TRANSPORTER_STATE.WITHDRAWING;
            return info;
        }
    }

    return info;
}

function withdraw(info) {
    const creep = Game.creeps[info.creep];
    const targetWithdraw = Game.getObjectById(info.targetWithdraw);

    if(targetWithdraw == undefined)
    {
        info.targetWithdraw = null;
        info.state = TRANSPORTER_STATE.IDLE;
        return info;
    }

    let result = -1;

    if(targetWithdraw instanceof Creep)
    {
        result = targetWithdraw.transfer(creep, RESOURCE_ENERGY);
    }
    else
    {
        result = creep.withdraw(targetWithdraw, RESOURCE_ENERGY);
    }

    if(result == ERR_NOT_IN_RANGE) {
        creep.moveTo(targetWithdraw);
    }
    else if(creep.store.getFreeCapacity(RESOURCE_ENERGY) <= 0)
    {
        info.state = TRANSPORTER_STATE.DEPOSITING;
        info.targetWithdraw = null;
    }
    else
    {
        info.state = TRANSPORTER_STATE.IDLE;
        info.targetWithdraw = null;
    }

    return info;
}

function deposit(info) {

    const creep = Game.creeps[info.creep];
    let targetDeposit = Game.getObjectById(info.targetDeposit);

    if(targetDeposit == null)
    {
        info.targetDeposit = findDepositable(info);
        return info;
    }

    let result = creep.transfer(targetDeposit, RESOURCE_ENERGY);

    if(result == ERR_NOT_IN_RANGE) {
        creep.moveTo(targetDeposit);
    }
    else if(result == ERR_FULL) {
        info.targetDeposit = findDepositable(info);
    }
    else if(creep.store.getUsedCapacity([RESOURCE_ENERGY]) == 0)
    {
        info.targetDeposit = null;
        info.targetWithdraw = findWithdrawable(info);
        info.state = info.targetWithdraw == null ? TRANSPORTER_STATE.IDLE : TRANSPORTER_STATE.WITHDRAWING
    }

    return info;
}

function findWithdrawable(info)
{
    let harvester = findHarvester(info);

    if(harvester != null)
    {
        return harvester;   
    }

    let store = findStorage(info);

    if(store != null)
    {
        return store;   
    }

    return null;
}

function findHarvester(info)
{
    const creep = Game.creeps[info.creep];
    const room = creep.room;

    let creeps = room.find(FIND_MY_CREEPS);

    let harvesters = creeps.filter(harvester => {
        return harvester.memory.task.name == "Harvest and Return" && 
            harvester.store.getUsedCapacity(RESOURCE_ENERGY) / harvester.store.getCapacity(RESOURCE_ENERGY) > 0.7
    })

    if(harvesters.length <= 0)
    {
        return null;
    }

    harvesters = harvesters.sort(function(x, y)
    {
        return y.pos - x.pos;
    })

    return harvesters[0].id;
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
    });

    return storedableStructures[0].id;
}

function findDepositable(info)
{
    const creep = Game.creeps[info.creep];
    const room = creep.room;

    let creeps = room.find(FIND_MY_CREEPS);

    let requestingCreeps = creeps.filter(requestee => {
        return requestee.store.getFreeCapacity(RESOURCE_ENERGY) / requestee.store.getCapacity(RESOURCE_ENERGY) > 0.7 && 
            creepsWhoNeedEnergy.includes(requestee.memory.task.name)
    });

    requestingCreeps.sort(function(x, y){
        return y.pos - x.pos;
    });

    if(requestingCreeps.length > 0)
    {
        return requestingCreeps[0].id;
    }

    let structures = room.find(FIND_MY_STRUCTURES);

    let storedableStructures = structures.filter(structure => {
        return structure.store != undefined
    })

    let requestingStructures = storedableStructures.filter(structure => {
        return structure.store.getFreeCapacity([RESOURCE_ENERGY]) > 0 && 
            functionalBuildings.includes(structure.structureType)
    });

    requestingStructures.sort(function(x, y){
        return functionalBuildingsPriority[y.structureType] - functionalBuildingsPriority[x.structureType];
    });

    if(requestingStructures.length <= 0)
    {
        return null;
    }

    return requestingStructures[0].id;
}

module.exports = process;