class GoalEvaluator
{
    static evaluate(goals)
    {
        goals = goals.filter(goal => {
            for(let i = 0; i < goal.preConditions.length; i += 1) {
                
                let condition = goal.preConditions[i];

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