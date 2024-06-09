const Planner = require("./planner");
const WorldState = require("./worldState");

const PROCESS = {
    RUNNING: 0,
    FAILURE: 1,
    SUCCESS: 2
};

class Commander
{
    constructor(worldState)
    {
        this.roomPlans = [];
        this.isCreatedFrame = true;
        this.worldState = worldState;
    }

    process()
    {
        if(this.isCreatedFrame == true)
        {
            this.roomPlans = this.worldState.loadSavedPlans();

            if(this.roomPlans == null)
            {
                this.roomPlans = [];   
            }

            this.isCreatedFrame = false;
        }

        if(this.roomPlans.length == 0)
        {
            const goals = this.worldState.getGoals();
            const actions = this.worldState.getActions();
    
            let plan = Planner.plan(goals, actions);
    
            if(plan == undefined)
            {
                return;
            }
    
            this.roomPlans.push(plan);
    
            let printedActions = [];
    
            for(let i = 0; i < plan.actions.length; i++)
            {
                printedActions.push(plan.actions[i].name);
            }
    
            console.log("Current Plan:", plan.name, JSON.stringify(printedActions));
        }

        let queuedRemoval = [];

        for(const roomPlanKey in this.roomPlans)
        {
            let plan = this.roomPlans[roomPlanKey];

            let processState = plan.process();

            switch(processState)
            {
                case PROCESS.RUNNING:
                    break;
                case PROCESS.FAILURE:
                    queuedRemoval.push(plan);
                    break;
                case PROCESS.SUCCESS:
                    queuedRemoval.push(plan);
                    break;
            }
        }

        this.roomPlans = this.roomPlans.filter(plan => {
            return !queuedRemoval.includes(plan);
        })

        savePlans(this.roomPlans);
    }
}

function savePlans(plans)
{
    let serializablePlans = [];

    for(const planKey in plans)
    {
        const plan = plans[planKey];
        let serializableActions = [];

        for(const actionKey in plan.actions)
        {
            const action = plan.actions[actionKey];

            serializableActions.push(action);
        }
        
        serializablePlans.push({
            name: plan.name,
            actions: serializableActions,
            actionIndex: plan.actionIndex,
            initalActionTick: plan.initalActionTick
        })
    }

    Memory["Commander"] = 
    {
        plans: serializablePlans
    }
}

module.exports = Commander;