class GoalEvaluator
{
    static evaluate(goals)
    {
        goals = goals.filter(goal => {
            for(let i = 0; i < goal.conditions.length; i += 1) {
                
                let condition = goal.conditions[i];

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