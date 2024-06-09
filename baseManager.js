const RoomEvaluator = require("./roomEvaluator");
const FortressBlueprint = require("./fortress");

class BaseManager {
    constructor() {
        this.blueprints = [FortressBlueprint];
    }

    showVisual(roomName) {
        RoomEvaluator.test_EvaluateRoom(roomName);
    }

    evaluateRoom(roomName) {
        let targetRoom = Game.rooms[roomName];

        if (targetRoom == undefined) {
            return null;
        }

        let grid = RoomEvaluator.evaluateRoom(roomName);

        if(grid == undefined) {
            return null
        }
        
        let positions = grid.getPositionsOverThreshold(9);

        if(positions.length == 0) {
            Memory.rooms[roomName] = {
                ignore: true,
                lastTickEval: Game.time
            }

            return null;   
        }
        
        Memory.rooms[roomName] = {
            grid: grid.save()
        }

        return positions;
    }

    assignBase(roomName, isMain)
    {
        let roomInfo = Memory.rooms[roomName];

        if(roomInfo != undefined && roomInfo.blueprint != undefined)
        {
            return;
        }

        let originPosition = isMain ? this.getMainOrigin(roomName) : this.getBestOrigin(roomName);

        if(originPosition == undefined)
        {
            return;
        }

        let blueprint = this.getBlueprint(roomName, originPosition, isMain);

        if(roomInfo == undefined)
        {
            Memory.rooms[roomName] = {
                blueprint: blueprint
            };
        }
        else
        {
            roomInfo.blueprint = blueprint;
            Memory.rooms[roomName] = roomInfo;
        }
    }
    
    //TODO have some sort of system for different blueprints.
    getBlueprint(roomName, originPosition, isMain)
    {
        let buildings = {};

        let bluePrintOrigin = isMain ? FortressBlueprint.mainOrigin : FortressBlueprint.remoteOrigin;

        let xDiff = originPosition.x - bluePrintOrigin.x;
        let yDiff = originPosition.y - bluePrintOrigin.y;

        for(let buildingKey in FortressBlueprint.buildings) {
            const building = FortressBlueprint.buildings[buildingKey];
            let positions = [];

            for(let i = 0; i < building.pos.length; i++) {
                let position = building.pos[i];

                let relativeX = position.x + xDiff;
                let relativeY = position.y + yDiff;

                positions[i] = new RoomPosition(relativeX, relativeY, roomName);
            }

            buildings[buildingKey] = {
                positions: positions
            };
        }

        return {
            name: FortressBlueprint.name,
            origin: originPosition,
            buildings: buildings
        };
    }

    getMainOrigin(roomName)
    {
        const room = Game.rooms[roomName];
        const spawns = room.find(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_SPAWN }
        })

        for(let spawnKey in spawns)
        {
            const spawn = spawns[spawnKey];

            if(spawn.room.name == roomName)
            {
                return spawns[spawnKey].pos;
            }
        }

        return null;
    }

    getBestOrigin(roomName)
    {
        let cells = this.evaluateRoom(roomName);

        if(cells == undefined) 
        {
            return null;
        }

        cells = cells.sort((x, y) => {
            return y.value - x.value;
        })

        return new RoomPosition(cells[0].pos.x, cells[0].pos.y, roomName);
    }
}

module.exports = BaseManager;