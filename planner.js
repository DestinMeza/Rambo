const GoalEvaluator = require("./goalEvaluator");

const maxDepth = 10;

class Planner {

    constructor(info)
    {
        this.name = info.name;
    }

    plan(goals, actions)
    {
        //Find target goal
        let bestGoal = GoalEvaluator.evaluate(goals);


        if(bestGoal == undefined) {
            console.log("No goal could be found.");
            return;    
        }

        let plan = [];

        plan = this.findPlan(bestGoal, actions, plan, [], 0);

        //Find target plan recursively
        if(plan == undefined) {
            console.log("No plan could be found.");
            return;
        }

        return { plan: plan, goal: bestGoal};
    }

    findPlan(bestGoal, actions, plan, matches, depth)
    {
        if(depth > maxDepth) {
            return undefined;
        }

        if(this.isCompletePlan(bestGoal, plan)) {

            return plan;
        }

        let foundMatches = [];
        let plans = [];

        if(matches.length > 0)
        {
            foundMatches.push(matches);
        }

        for(let i = 0; i < actions.length; i += 1){

            foundMatches = this.findMatchingConditions(bestGoal, foundMatches, actions[i]);

            if(foundMatches.length > 0)
            {
                plans.push(actions[i]);
            }

            let newPlan = this.findPlan(bestGoal, actions, plans, foundMatches, depth + 1);

            if(newPlan != undefined && newPlan.length > 0) {
                return newPlan;
            }
        }
    }

    findMatchingConditions(goal, foundMatches, action)
    {
        let matches = [];

        goal.conditions.forEach(condition => {
            if(action.conditions.includes(condition) && !foundMatches.includes(condition)) {
                matches.push(condition);
            }
        });

        return matches;
    }

    isCompletePlan(goal, plan)
    {
        if(plan.length <= 0)
        {
            return false;   
        }

        goal.conditions.forEach(condition => {
            if(!plan.includes(condition)) {
                return false;
            }
        });

        return true;
    }
}

module.exports = Planner;