const Planner = require("./planner");
const WorldState = require("./worldState");

const PROCESS = {
    RUNNING: 0,
    FAILURE: 1,
    SUCCESS: 2
};

class Commander
{
    constructor(info)
    {
        this.name = info.name;
        this.roomPlans = [];
        this.isCreatedFrame = true;
    }

    loadSavedPlans()
    {
        const savedCommander = Memory[this.name];

        if (savedCommander == undefined) {
            return;   
        }
        if (Memory[this.name].plans == undefined)
        {
            return;   
        }

        let plans = [];

        return plans;
    }

    process()
    {
        let worldState = WorldState.getInstance();

        const goals = worldState.getGoals();
        const actions = worldState.getActions();

        let plan = Planner.plan(goals, actions);

        if(plan == undefined)
        {
            return;
        }

        let printedActions = [];

        for(let i = 0; i < plan.actions.length; i++)
        {
            printedActions.push(plan.actions[i].name);
        }

        console.log("Current Plan:", plan.name, JSON.stringify(printedActions));

        let processState = plan.process();

        switch(processState)
        {
            case PROCESS.RUNNING:
                break;
            case PROCESS.FAILURE:
                plan = null;
                break;
            case PROCESS.SUCCESS:
                plan = null;
                break;
        }

        this.isCreatedFrame = false;

        savePlans(this.roomPlans);
    }
}

function savePlans(plans)
{
    if(plans)
    {
        return null;
    }
    
    Memory[this.name] = 
    {
        name: this.name,
        plans: plans
    }
}

module.exports = Commander;