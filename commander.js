const Condition = require("./condition");
const Action = require("./action");
const Goal = require("./goal");
const Planner = require("./planner");
const Plan = require("./plan");
const Task = require("./task");

const ActionManager = require("./actionManager");

const PROCESS = Object.freeze({
    RUNNING: 0,
    FAILURE: 1,
    SUCCESS: 2
});

class Commander
{
    constructor(info)
    {
        this.name = info.name;
        this.currentPlan = null;
        this.isCreatedFrame = true;
        this.actionManager = new ActionManager(info.name);
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

        this.goals = [
            this.actionManager.goalMap["Idle"],
            this.actionManager.goalMap["Spawn Creep"],
            this.actionManager.goalMap["Collect Resource"]
        ]

        this.actions = [
            this.actionManager.actionMap["Idle"],
            this.actionManager.actionMap["Spawn Creep"],
            this.actionManager.actionMap["Assign Creep Task"]
        ]

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
                actions: planInfo.plan,
                actionIndex: 0
            });

            console.log("Plan found,", this.currentPlan.name)
        }
        else {
            let processState = this.currentPlan.process();

            switch(processState)
            {
                case PROCESS.RUNNING:
                    break;
                case PROCESS.FAILURE:
                    console.log("Current Plan has failed!");
                    this.currentPlan = null;
                    break;
                case PROCESS.SUCCESS:
                    console.log("Plan has Completed!");
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
                name: this.currentPlan.actions[action].name
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