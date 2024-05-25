const Grid = require("./grid");
const gridSize = 50;

module.exports = {
    
    evaluateRoom: function(roomName) {
        //Check if has info in save
        let info = Memory.rooms[roomName];

        let roomGrid = info != undefined ? this.loadRoomInfo(info) : this.generateRoomInfo(roomName);

        return roomGrid;
    },

    test_EvaluateRoom: function(roomName) {
        let grid = this.evaluateRoom(roomName);
        grid.visualize(Game.rooms[roomName].visual);

        return grid;
    },
    
    loadRoomInfo: function(save)
    {
        let loadedGrid = new Grid(gridSize);
        loadedGrid.load(save);

        return loadedGrid;
    },

    generateRoomInfo: function(roomName) {
        return this.calculateRoomCost(roomName);
    },

    calculateRoomCost: function(roomName) {
        const room = Game.rooms[roomName];
        const terrain = room.getTerrain();
        let grid = new Grid(gridSize);

        for(let y = 0; y < gridSize; y++) {
            for(let x = 0; x < gridSize; x++) {
                const tile = terrain.get(x, y);
                const unbuildable = tile === TERRAIN_MASK_WALL || tile === TERRAIN_MASK_SWAMP;
                const value = unbuildable
                    ? 0  // unbuildable => weight: 1
                    : -1 ; // plain => weight: -1
                grid.set(x, y, value);
            }
        }

        let index = 0;

        while(!grid.isComplete())
        {
            for(let y = 0; y < gridSize; y++) {
                for(let x = 0; x < gridSize; x++) {
                    if(grid.get(x, y) != -1)
                    {
                        continue;
                    }

                    let dist = this.findNearestWallDist(grid, {x, y}, index)
                    grid.set(x, y, dist);
                }
            }
            
            index++;
            if(index > 25)
            {
                console.log("Exceeded max search");
                break;
            }
        }

        Memory.rooms[roomName] = {
            grid: grid.save()
        }

        return grid;
    },

    findNearestWallDist: function(refGrid, currentPos, targetNeighbor) {
        const directions = [
            {x:-1, y:-1},  //UP-LEFT
            {x: 0, y:-1},  //UP
            {x: 1, y:-1},  //UP-RIGHT
            {x: 1, y: 0},  //RIGHT
            {x: 1, y: 1},  //DOWN-RIGHT
            {x: 0, y: 1},  //DOWN
            {x:-1, y: 1},  //DOWN-LEFT
            {x: -1, y: 0}, //LEFT
        ];

        let updateValue = 50;

        //Iterate through all nearby cells. Check if wall near.
        for(const directionKey in directions)
        {
            const direction = directions[directionKey];

            const x = direction.x + currentPos.x;
            const y = direction.y + currentPos.y;

            if(x <= -1 || x >= 50 || y <= -1 || x >= 50)
            {
                continue;
            }

            let foundValue = refGrid.get(x, y);

            if(foundValue == targetNeighbor && updateValue > foundValue)
            {
                updateValue = targetNeighbor + 1;
                break;
            }
        }

        if(updateValue == 50)
        {
            updateValue = -1;
        }

        return updateValue;
    }
}