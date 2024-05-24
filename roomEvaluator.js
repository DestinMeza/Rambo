const Grid = require("./grid");
const gridSize = 50;

module.exports = {
    
    evaluateRoom: function(roomName) {
        //Check if has info in save
        let info = Memory.rooms[roomName];

        let roomGrid = info != undefined ? this.loadRoomInfo(info) : this.generateRoomInfo(roomName);

        roomGrid.visualize(Game.rooms[roomName].visual);
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
                const weight =
                    tile === TERRAIN_MASK_WALL || tile === TERRAIN_MASK_SWAMP 
                    ? 1  // unbuildable => weight: 1
                    : 0 ; // plain => weight: 0
                grid.set(x, y, weight);
            }
        }

        let finalGrid = new Grid(gridSize);
        
        for(let y = 0; y < gridSize; y++) {
            for(let x = 0; x < gridSize; x++) {
                let value = grid.get(x, y);

                if(value == 1) {
                    continue;
                }

                let dist = this.findNearestWallDist(grid, {x, y})
                finalGrid.set(x, y, dist);
            }
        }

        Memory.rooms[roomName] = {
            grid: finalGrid.save()
        }

        return finalGrid;
    },

    findNearestWallDist: function(refGrid, currentPos) {
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

        let lowestValue = 50;

        for(const directionKey in directions)
        {
            for(let s = 1; s < gridSize; s++)
            {
                const direction = directions[directionKey];

                const x = direction.x * s + currentPos.x;
                const y = direction.y * s + currentPos.y;

                if(x <= -1 || x >= 50 || y <= -1 || x >= 50)
                {
                    if(lowestValue > s)
                    {
                        lowestValue = s;
                    }
                    continue;
                }

                if(refGrid.get(x, y) == 1 && lowestValue > s)
                {
                    lowestValue = s;
                }
            }
        }

        return lowestValue;
    }
}