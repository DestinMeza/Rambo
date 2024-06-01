class GoalEvaluator
{
    static evaluate(goals)
    {
        goals = goals.filter(goal => {

            const goalPreconditions = goal.getPreConditions();

            for(let i = 0; i < goalPreconditions.length; i += 1) {
                
                let condition = goalPreconditions[i];

                if(!condition.evaluate())
                {
                    return false;
                }
            }

            return true;
        });

        goals.sort(function(x, y) {
            return y.priority - x.priority;
        })

        return goals[0];
    }
}

module.exports = GoalEvaluator;