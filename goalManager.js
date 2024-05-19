const Goal = require("./goal");

class GoalManager
{
    constructor(info)
    {
        this.commander = info.commander;
        this.worldState = info.worldState;
        
        this.goalMap = 
        {
            Idle: new Goal({
                name: "Idle",
                priority: 0.1,
            }),
            Collect_Resource: new Goal({
                name: "Collect_Resource",
                priority: 1.0,
            })
        }
    }

    process() {
        for(const key in this.goalMap) {
            this.goalMap[key].preConditions = this.worldState.goalPreConditionMap[key];         
            this.goalMap[key].postConditions = this.worldState.goalPostConditionMap[key];             
        }
    }
}

module.exports = GoalManager;