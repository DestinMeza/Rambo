const PROCESS = {
    RUNNING: 0,
    FAILURE: 1,
    SUCCESS: 2
};

const buildingPriority = {
    [STRUCTURE_SPAWN]: 0,
    [STRUCTURE_EXTENSION]: 1,
    [STRUCTURE_ROAD]: 2,
    [STRUCTURE_WALL]: 3,
    [STRUCTURE_RAMPART]: 4,
    [STRUCTURE_PORTAL]: 5,
    [STRUCTURE_CONTROLLER]: 6,
    [STRUCTURE_LINK]: 7,
    [STRUCTURE_STORAGE]: 8,
    [STRUCTURE_TOWER]: 9,
    [STRUCTURE_OBSERVER]: 10,
    [STRUCTURE_POWER_BANK]: 11,
    [STRUCTURE_POWER_SPAWN]: 12,
    [STRUCTURE_EXTRACTOR]: 13,
    [STRUCTURE_LAB]: 14,
    [STRUCTURE_TERMINAL]: 15,
    [STRUCTURE_CONTAINER]: 16,
    [STRUCTURE_NUKER]: 17,
    [STRUCTURE_FACTORY]: 18,
}

function process (self) {
    const roomName = self.roomName;
    const room = Game.rooms[roomName];
    const blueprint = Memory.rooms[roomName].blueprint;
    const roomControllerLevel = room.controller.level;

    const buildings = blueprint.buildings.sort(function(x, y)
    {
        return buildingPriority[x.type] - buildingPriority[y.type];
    })

    if (room == undefined || blueprint == undefined)
    {
        return PROCESS.FAILURE;   
    }

    for(let i = self.buildingTypeIndex; i < buildings.length; i++)
    {
        const buildingInfo = buildings[i];
        let maxCount = CONTROLLER_STRUCTURES[buildingInfo.type][roomControllerLevel];
        let bluePrintMax = buildingInfo.positions.length;

        if(maxCount == 0 || bluePrintMax == 0)
        {
            continue;   
        }

        for(let j = self.buildingPosIndex; j < bluePrintMax && j < maxCount; j++)
        {
            const positionInfo = buildingInfo.positions[j];

            let sites = room.lookForAt(LOOK_CONSTRUCTION_SITES, positionInfo.x, positionInfo.y);

            if(sites.length > 0)
            {
                continue;   
            }

            let result = placeConstructionSite(room, {
                x: positionInfo.x,
                y: positionInfo.y,
                type: buildingInfo.type
            });

            if(result)
            {
                self.buildingTypeIndex = i;
                self.buildingPosIndex = j;
            }
        }
    }

    return PROCESS.SUCCESS;
}

function placeConstructionSite(room, building)
{
    const result = room.createConstructionSite(building.x, building.y, building.type);

    if(result == ERR_INVALID_ARGS)
    {
        console.log("Error creating construction site", building.x, building.y, building.type);
        return false;
    }
    else if(result != OK)
    {
        return false;   
    }

    return true;
}

module.exports = process;