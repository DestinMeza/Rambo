const Action = require("./action");
const Condition = require("./condition");
const Goal = require("./goal");
const GoalEvaluator = require("./goalEvaluator");
const Node = require("./node");
const NodeTree = require("./nodeTree");
const WorldState = require("./worldState");

const maxDepth = 20;

class Planner {

    /**
     * @param {Object} info
     * @param {string} info.name
     */
    constructor(info)
    {
        this.name = info.name;
    }

    /**
     * @param {Goal[]} goals 
     * @param {Action[]} actions
     */
    plan(goals, actions)
    {
        //Find target goal
        let bestGoal = GoalEvaluator.evaluate(goals);

        if(bestGoal == undefined) {
            console.log("No goal could be found.");
            return;    
        }

        //Create new World State to simulate
        let worldSim = new WorldState();
        
        //Find best last action
        let lastNode = this.findLastNode(bestGoal, actions);

        let rootNodeWithChildren = this.findPlan(
            bestGoal, 
            actions, 
            lastNode, 
            worldSim,
            0
        );

        let nodeTree = new NodeTree(rootNodeWithChildren);

        let plan = nodeTree.getActions();

        //Find target plan recursively
        if(plan == undefined) {
            console.log("No plan could be found.");
            return;
        }

        return { plan: plan, goal: bestGoal};
    }

    /**
     * @param {Goal} bestGoal
     * @param {Action[]} actions
     */
    findLastNode(bestGoal, actions)
    {
        let matchList = [];

        actions.forEach(action => {
            let postConditionMatches = [];

            for(let conditionKey in bestGoal.conditions)
            {
                let condition = bestGoal.conditions[conditionKey];
                
                if(action.postConditions.includes(condition))
                {
                    postConditionMatches.push(condition);
                }
            }

            matchList.push({
                action: action,
                matches: postConditionMatches
            });
        })

        matchList = matchList.sort(function(x, y)
        {
            return y.matches.length - x.matches.length;
        });

        return new Node({
            parent: null,
            action: matchList[0].action,
            isMarked: false,
        })
    }
    
    /**
     * @param {Goal} bestGoal
     * @param {Action[]} actions
     * @param {Node} node
     * @param {WorldState} worldSim
     * @param {int} depth 
     */
    findPlan(bestGoal, actions, node, worldSim, depth)
    {
        if(depth > maxDepth)
        {
            return undefined;
        }

        if(this.isGoalSatisfied(bestGoal, node))
        {
            return node;
        }

        for(let i = 0; i < actions.length; i += 1)
        {
            if(!this.isChildNodeable(node, actions[i], worldSim))
            {
                return undefined;
            }

            let childNode = new Node({
                parent: node,
                action: actions[i],
                isMarked: false,
            })

            node.children.push(childNode);

            let foundCompletedNode = this.findPlan(bestGoal, actions, childNode, depth + 1);

            if(foundCompletedNode)
            {
                childNode.isMarked = true;
                return childNode;   
            }
        }

        return undefined;
    }

    /**\
     * @param {Node} parentNode
     * @param {WorldState} worldState
     * @param {Action} action 
     */
    isChildNodeable(parentNode, worldState, action)
    {
        return parentNode.evaluateNode(worldState, action);
    }

    /**
     * 
     * @param {Goal} bestGoal
     * @param {Node} node 
     */
    isGoalSatisfied(bestGoal, node)
    {        
        bestGoal.conditions.forEach(condition => {
            if(!this.isConditionSatisfied(condition, node))
            {
                return false
            }
        });

        node.isMarked = true;
        return true;
    }

    /**
     * 
     * @param {Condition} condition 
     * @param {Node} node 
     */
    isConditionSatisfied(condition, node)
    {
        if(node.postConditions.includes(condition))
        {
            return true;   
        }

        node.children.forEach(childNode => {
            if(this.isConditionSatisfied(condition, childNode))
            {
                return true;   
            }
        });

        return false;
    }
}

module.exports = Planner;