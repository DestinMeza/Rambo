const PROCESS = {
    RUNNING: 0,
    FAILURE: 1,
    SUCCESS: 2
};

class Plan
{
    constructor(info)
    {
        this.name = info.name;
        this.actions = info.actions;
        this.actionIndex = info.actionIndex;
        this.initalActionTick = info.initalActionTick;

        for(let i = 0; i < this.actions.length - 1; i++)
        {
            this.actions[i].nextAction = this.actions[i + 1];
        }
    }

    process()
    {
        let currentAction = this.actions[this.actionIndex];

        if(!currentAction.hasStarted)
        {
            currentAction.start(currentAction);
            currentAction.hasStarted = true;
        }

        let processState = currentAction.process(currentAction);

        if(processState == PROCESS.SUCCESS)
        {
            let newActionIndex = this.actionIndex + 1;

            if(this.actions.length > newActionIndex)
            {
                this.actionIndex = newActionIndex;
                processState = PROCESS.RUNNING;

                return processState;
            }
        }

        return processState;
    }
}

module.exports = Plan;