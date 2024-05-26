module.exports = {
    getCreepBody(requiredBodyParts, possibleBodyParts, roomName)
    {
        const room = Game.rooms[roomName];

        let energyStructures = room.find(FIND_MY_STRUCTURES, {
            filter: function(structure)
            {
                return  structure.structureType == STRUCTURE_SPAWN || 
                        structure.structureType == STRUCTURE_EXTENSION;
            }
        })

        let totalAvailableEnergy = 0;

        for(const structureKey in energyStructures)
        {
            const structure = energyStructures[structureKey];

            totalAvailableEnergy += structure.store[RESOURCE_ENERGY];
        }

        for(const partKey in requiredBodyParts)
        {
            const bodyPart = requiredBodyParts[partKey];   

            totalAvailableEnergy -= BODYPART_COST[bodyPart];
        }

        return buildCreepBody(requiredBodyParts, possibleBodyParts, totalAvailableEnergy);
    }
}

function buildCreepBody(requiredBodyParts, possibleBodyParts, totalAvailableEnergy)
{
    let creepBody = requiredBodyParts;

    let failedToMakeCount = 0;

    while(failedToMakeCount < possibleBodyParts.length)
    {
        for(const partIndex in possibleBodyParts)
        {
            const currentPart = possibleBodyParts[partIndex];

            if(!evaluatePartCost(totalAvailableEnergy, currentPart))
            {
                failedToMakeCount++;
                continue;
            }

            totalAvailableEnergy -= BODYPART_COST[currentPart]
            creepBody.push(currentPart);
        }
    }

    return creepBody;
}

function evaluatePartCost(totalAvailableEnergy, bodyPart)
{
    return totalAvailableEnergy - BODYPART_COST[bodyPart] >= 0;
}