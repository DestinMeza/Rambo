const Goal = require("./goal");
const WorldState = require("./worldState");

class GoalManager
{
    /**
     * @param {Object} info
     * @param {WorldState} info.worldState 
     */
    constructor(info)
    {
        this.commanderName = info.commanderName;
        this.worldState = info.worldState;
        
        this.goalMap = 
        {
            Idle: new Goal({
                name: "Idle",
                priority: 0.01,
                preconditions: [],
                postconditions: []
            }),
            Collect_Energy: new Goal({
                name: "Collect_Energy",
                priority: 1.0,
                preconditions: [],
                postconditions: []
            }),
            Upgrade_Room: new Goal({
                name: "Upgrade_Room",
                priority: 1.0,
                preconditions: [],
                postconditions: []
            })
        }
    }

    getGoals()
    {        
        let goalArray = [];
        
        for(const goalKey in this.goalMap)
        {
            goalArray.push(this.goalMap[goalKey]);
        }

        return goalArray;
    }

    process() {
        for(const key in this.goalMap) {
            this.goalMap[key].priority = this.worldState.goalPriorityMap[key];
            this.goalMap[key].preConditions = this.worldState.goalPreConditionMap[key];         
            this.goalMap[key].postConditions = this.worldState.goalPostConditionMap[key];             
        }
    }
}

module.exports = GoalManager;