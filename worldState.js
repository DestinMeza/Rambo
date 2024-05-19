const Condition = require("./condition");

class WorldState
{
    constructor()
    {
        this.process();
    }

    process()
    {
        this.spawn = Game.spawns['Spawn1'];
        this.store = this.spawn.store;
        this.energy = this.store[RESOURCE_ENERGY];
        this.randomNumber = Math.floor(Math.random() * 10000);
        this.capacityRatio = this.store.getUsedCapacity(RESOURCE_ENERGY) / this.store.getCapacity(RESOURCE_ENERGY);
        this.creepsWithoutTaskCount = 0;

        for(const creep in Game.creeps)
        {
            if(Game.creeps[creep].memory.task == undefined)
            {
                this.creepsWithoutTaskCount += 1;
            }
        }

        this.conditions = {
            ["Idle"]: new Condition({
                name: "Idle",
                condition: true
            }),
            ["Idle Creeps"]: new Condition({
                name: "Idle Creeps",
                condition: this.creepsWithoutTaskCount > 0
            }),
            ["Creep Spawn Cost"]: new Condition({
                name: "Creep Spawn Cost",
                condition: this.energy > 200
            }),
            ["Wait For Spawn"]: new Condition({
                name: "Wait For Spawn",
                condition: this.spawn.spawning == undefined
            })
        };
    }
}

module.exports = WorldState;