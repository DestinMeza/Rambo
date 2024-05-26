const Planner = require("./planner");
const Plan = require("./plan");

const ActionManager = require("./actionManager");
const GoalManager = require("./goalManager");

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
        this.worldState = info.worldState;
        this.currentPlan = null;
        this.isCreatedFrame = true;
        this.actionManager = new ActionManager({
            commanderName: this.name,
            worldState: this.worldState
        });
        this.goalManager = new GoalManager({
            commanderName: this.name,
            worldState: this.worldState
        });
    }

    setup()
    {
        this.planner = new Planner({
            name: "Default Planner"
        })
    }

    loadSavedPlan()
    {
        const savedCommander = Memory[this.name];

        if (savedCommander == undefined) {
            return;   
        }
        if (Memory[this.name].plan == undefined)
        {
            return;   
        }
        
        let actions = this.actionManager.getSavedActions();

        let newPlan = new Plan({
            name: Memory[this.name].plan.name,
            actions: actions,
            actionIndex: Memory[this.name].plan.actionIndex
        });

        return newPlan;
    }

    process()
    {
        this.actionManager.process();
        this.goalManager.process();

        this.actions = this.actionManager.getActions();
        this.goals = this.goalManager.getGoals();

        if(this.isCreatedFrame)
        {
            this.setup();
        }

        if(this.currentPlan == null)
        {
            let loadedPlan = this.loadSavedPlan();

            if(loadedPlan != undefined)
            {
                this.currentPlan = loadedPlan;
                
                if(loadedPlan.actions.length == 0)
                {
                    this.currentPlan = null;
                }
            }
        }

        if(this.currentPlan == null) {

            let planInfo = this.planner.plan(this.goals, this.actions);

            if(planInfo == undefined)
            {
                console.log("Planner failed to return a valid plan.");
                return;
            }
            
            this.currentPlan = new Plan({
                name: planInfo.goal.name,
                actions: planInfo.actions,
                actionIndex: 0
            });

            let printedActions = [];

            for(let i = 0; i < planInfo.actions.length; i++)
            {
                printedActions.push(planInfo.actions[i].name);
            }

            console.log("Current Plan:", this.currentPlan.name, JSON.stringify(printedActions));

            Memory[this.name] = 
            {
                name: this.name,
                plan: this.getPlanSerializable()
            }
        }
        else {
            let processState = this.currentPlan.process();

            switch(processState)
            {
                case PROCESS.RUNNING:
                    break;
                case PROCESS.FAILURE:
                    this.currentPlan = null;
                    break;
                case PROCESS.SUCCESS:
                    this.currentPlan = null;
                    break;
            }

            Memory[this.name] = 
            {
                name: this.name,
                plan: this.getPlanSerializable()
            }
        }

        this.isCreatedFrame = false;
    }

    getPlanSerializable()
    {
        if(this.currentPlan == undefined)
        {
            return null;
        }

        let actions = [];

        for(const action in this.currentPlan.actions)
        {
            var serializedAction = 
            {
                name: this.currentPlan.actions[action].name,
                hasStarted: this.currentPlan.actions[action].hasStarted,
                data: this.currentPlan.actions[action].data
            }

            actions.push(serializedAction);
        }

        return {
            name: this.currentPlan.name, 
            actions: actions,
            actionIndex: this.currentPlan.actionIndex
        }
    }
}

module.exports = Commander;