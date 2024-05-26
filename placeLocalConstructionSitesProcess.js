const PROCESS = {
    RUNNING: 0,
    FAILURE: 1,
    SUCCESS: 2
};

function process (self) {
    const roomName = self.data.roomName;
    const room = Game.rooms[roomName];
    const blueprint = Memory.rooms[roomName].blueprint;
    const roomControllerLevel = room.controller.level;

    if (room == undefined || blueprint == undefined)
    {
        return PROCESS.FAILURE;   
    }

    for(const buildingKey in blueprint.buildings)
    {
        const buildingInfo = blueprint.buildings[buildingKey];
        let maxCount = CONTROLLER_STRUCTURES[buildingInfo.type][roomControllerLevel];
        let bluePrintMax = buildingInfo.positions.length;

        if(maxCount == 0 || bluePrintMax == 0)
        {
            continue;   
        }

        for(let i = 0; i < bluePrintMax && i < maxCount; i++)
        {
            const positionInfo = buildingInfo.positions[i];

            placeConstructionSite(room, {
                x: positionInfo.x,
                y: positionInfo.y,
                type: buildingInfo.type
            });
        }
    }

    return PROCESS.SUCCESS;
}

function placeConstructionSite(room, building)
{
    const result = room.createConstructionSite(building.x, building.y, building.type);

    if(result == ERR_INVALID_ARGS)
    {
        //console.log("Error creating construction site", building.x, building.y, building.type);
        return false;
    }
    else if(result != OK)
    {
        //console.log("Error creating construction site", result);
        return false;   
    }

    return true;
}

module.exports = process;