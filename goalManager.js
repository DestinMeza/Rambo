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
            Collect_Energy: new Goal({
                name: "Collect_Energy",
                priority: 1.0,
                preconditions: [],
                postconditions: []
            }),
            Upgrade_Room: new Goal({
                name: "Upgrade_Room",
                priority: 0.9,
                preconditions: [],
                postconditions: []
            }),
            Build_Additional_Structures: new Goal({
                name: "Build_Additional_Structures",
                priority: 0.8,
                preconditions: [],
                preconditions: [],
            }),
            Create_Builders: new Goal({
                name: "Create_Builders",
                priority: 0.7,
                preconditions: [],
                preconditions: [],
            }),
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