const PROCESS = {
    RUNNING: 0,
    FAILURE: 1,
    SUCCESS: 2
};

const BUILDING_PRIORITY = {
    [STRUCTURE_SPAWN]: 18,
    [STRUCTURE_EXTENSION]: 17,
    [STRUCTURE_ROAD]: 16,
    [STRUCTURE_WALL]: 15,
    [STRUCTURE_RAMPART]: 14,
    [STRUCTURE_PORTAL]: 13,
    [STRUCTURE_CONTROLLER]: 12,
    [STRUCTURE_LINK]: 11,
    [STRUCTURE_STORAGE]: 10,
    [STRUCTURE_TOWER]: 9,
    [STRUCTURE_OBSERVER]: 8,
    [STRUCTURE_POWER_BANK]: 7,
    [STRUCTURE_POWER_SPAWN]: 6,
    [STRUCTURE_EXTRACTOR]: 5,
    [STRUCTURE_LAB]: 4,
    [STRUCTURE_TERMINAL]: 3,
    [STRUCTURE_CONTAINER]: 2,
    [STRUCTURE_NUKER]: 1,
    [STRUCTURE_FACTORY]: 0,
}

function process (self) {
    const room = Game.rooms[self.room];

    if(room == undefined)
    {
        return PROCESS.FAILURE;
    }

    const foundCreeps = room.find(FIND_MY_CREEPS, {
        filter: (creep) => {
            if(creep.memory == undefined)
            {
                return false;
            }

            if(creep.memory.task == undefined)
            {
                return false;
            }

            return creep.memory.task.requestingSite;
        }}
    );

    if(foundCreeps.length <= 0)
    {
        return PROCESS.FAILURE;   
    }
    
    const creep = foundCreeps[0];

    if(creep == undefined || creep.spawning)
    {
        return PROCESS.RUNNING;
    }

    const blueprint = room.memory.blueprint;

    if(blueprint == null)
    {
        return PROCESS.FAILURE;
    }

    for(const buildingKey in BUILDING_PRIORITY)
    {
        const buildingInfo = blueprint.buildings[buildingKey];

        const MAXINFO = CONTROLLER_STRUCTURES[buildingKey];
        let buildingMax = MAXINFO[room.controller.level];

        const buildingsBuilt = room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == buildingKey;
            }
        });

        //Check next blueprint priority, blueprint or room level not sufficent.
        if(buildingsBuilt.length >= buildingInfo.positions.length || buildingsBuilt.length >= buildingMax)
        {
            continue;
        }

        let buildingIndex = buildingsBuilt.length;

        let positionInfo = buildingInfo.positions[buildingIndex];

        const foundObjects = room.lookAt(positionInfo.x, positionInfo.y);

        const constructionSites = foundObjects.filter((foundObject) => {
            return foundObject.type == LOOK_CONSTRUCTION_SITES 
                && foundObject.constructionSite.structureType == buildingKey
        })

        let targetSite = null;

        //Create Construction site if it doesn't exist.
        if(constructionSites.length <= 0)
        {
            const result = room.createConstructionSite(positionInfo.x, positionInfo.y, buildingKey);

            if(result != OK)
            {
                return PROCESS.FAILURE;
            }
            
            const sitesFound = room.find(FIND_MY_CONSTRUCTION_SITES, {
                filter: (structure) => {
                    return structure.pos.x == positionInfo.x && 
                    structure.pos.y == positionInfo.y;
                }
            });

            targetSite = sitesFound[0];
        }
        else
        {
            targetSite = constructionSites[0].constructionSite;
        }

        if(targetSite == null)
        {
            return PROCESS.FAILURE;
        }

        creep.memory.task.constructionSite = targetSite.id;
        creep.memory.task.requestingSite = false;
        return PROCESS.SUCCESS;
    }

    return PROCESS.SUCCESS;
}

module.exports = process;