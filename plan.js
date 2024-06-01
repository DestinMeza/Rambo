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

        switch(processState) {
            case PROCESS.SUCCESS:
                let newActionIndex = this.actionIndex + 1;

                if(newActionIndex < this.actions.length)
                {
                    this.actionIndex = newActionIndex;
                    processState = PROCESS.RUNNING;
                    break;
                }
                
                processState = PROCESS.SUCCESS;
            default:
                break;
        }

        return processState;
    }
}

module.exports = Plan;