const PROCESS = Object.freeze({
    RUNNING: 0,
    FAILURE: 1,
    SUCCESS: 2
});

class Plan
{
    constructor(info)
    {
        this.name = info.name;
        this.actions = info.actions;
        this.actionIndex = info.actionIndex;
    }

    process()
    {
        let currentAction = this.actions[this.actionIndex];
        
        let processState = currentAction.process(currentAction);

        if(processState == PROCESS.SUCCESS)
        {
            let newActionIndex = this.actionIndex += 1;

            if(newActionIndex > this.actions.length)
            {
                return PROCESS.SUCCESS; // SUCCESS
            }
        }

        return processState;
    }
}

module.exports = Plan;