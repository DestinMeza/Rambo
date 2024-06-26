const Action = require("./action");
const Condition = require("./condition");
const Goal = require("./goal");
const GoalEvaluator = require("./goalEvaluator");
const Node = require("./node");
const NodeTree = require("./nodeTree");
const Plan = require("./plan");

const maxDepth = 5;

class Planner
{
    /**
     * @param {Goal[]} goals 
     * @param {Action[]} actions
     */
    static plan(goals, actions)
    {
        //Find target goal
        let bestGoal = GoalEvaluator.evaluate(goals);

        if(bestGoal == undefined) {
            return;    
        }

        //Find best last action
        let lastNode = findLastNode(bestGoal, actions);

        if(lastNode == null)
        {
            return;
        }

        let rootNodeWithChildren = findPlan(
            bestGoal, 
            actions, 
            lastNode,
            0
        );

        if(rootNodeWithChildren == undefined)
        {
            return;
        }
        
        let nodeTree = new NodeTree({
            rootNode: rootNodeWithChildren
        });

        let plannedActions = nodeTree.getActions();

        //Find target plan recursively
        if(plannedActions == undefined || plannedActions.length == 0) {
            return;
        }

        const plan = new Plan({
            name: bestGoal.name,
            actions: plannedActions,
            actionIndex: 0,
            initalActionTick: Game.tick
        }); 

        return plan;
    }
}

/**
 * @param {Goal} bestGoal
 * @param {Action[]} actions
 */
function findLastNode(bestGoal, actions)
{
    let matchList = [];

    for(let i = 0; i < actions.length; i++)
    {
        const action = actions[i];
        let cost = action.cost;

        //Evaluate if action satisfies goal beliefs.

        let sharesBeliefs = true;
        
        for(const beliefKey in bestGoal.beliefs)
        {
            const belief = bestGoal.beliefs[beliefKey];

            if(!action.beliefs.includes(belief))
            {
                sharesBeliefs = false;
                break;
            }
        }

        if(sharesBeliefs == false)
        {
            continue;   
        }

        //Get matching post conditions count.
        let postConditionMatches = [];

        const bestGoalPostConditions = bestGoal.getPostConditions();

        for(const conditionKey in bestGoalPostConditions)
        {
            const condition = bestGoalPostConditions[conditionKey];
            const actionPostConditions = action.getPostConditions();

            if(actionPostConditions.includes(condition))
            {
                postConditionMatches.push(condition);
            }
        }

        cost += postConditionMatches.length;

        matchList.push({
            action: action,
            cost: cost,
        });
    }

    if(matchList.length == 0)
    {
        return null;
    }

    matchList = matchList.sort(function(x, y)
    {
        return y.cost - x.cost;
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
 * @param {int} depth 
 */
function findPlan(bestGoal, actions, node, depth)
{
    if(depth > maxDepth)
    {
        return undefined;
    }

    if(isGoalSatisfied(bestGoal, node))
    {
        return node;
    }

    for(let i = 0; i < actions.length; i += 1)
    {
        if(actions[i] == node.action)
        {
            continue;
        }

        //Evaluate the beleifs if action has belief and see if they match for children actions.
        if(actions[i].beliefs != undefined)
        {
            let sharesBeliefs = true;

            for(let j = 0; j < actions[i].beliefs.length; j++)
            {
                if(!bestGoal.beliefs.includes(actions[i].beliefs[j]))
                {
                    sharesBeliefs = false;
                    break;
                }
            }

            if(sharesBeliefs == false)
            {
                continue;
            }
        }

        if(!isChildNodeable(node, actions[i]))
        {
            continue;
        }

        let childNode = new Node({
            parent: node,
            action: actions[i],
            isMarked: false,
        })

        node.addChild(childNode);

        let newActions = actions.filter((_, index) => {
            return index != i;
        })

        let foundCompletedNode = findPlan(bestGoal, newActions, childNode, depth + 1);

        if(foundCompletedNode != undefined)
        {
            let rootNode = findRootNode(childNode);
            return rootNode;   
        }
    }

    return undefined;
}

/**\
 * @param {Node} parentNode
 * @param {Action} action 
 */
function isChildNodeable(parentNode, action)
{
    return parentNode.evaluateNode(action);
}

/**
 * @param {Goal} bestGoal
 * @param {Node} node 
 */
function isGoalSatisfied(bestGoal, node)
{
    let rootNode = findRootNode(node);

    const goalPostConditions = bestGoal.getPostConditions();

    //Check from root of tree if post conditions are met for goal.
    for(let i = 0; i < goalPostConditions.length; i++)
    {
        const condition = goalPostConditions[i];
        if(!isPostConditionSatisfied(condition, rootNode))
        {
            return false
        }
    }

    //Check from root of tree to see if root tree nodes are satisfied.
    if(!isPreConditionSatisfied(node))
    {
        return false;
    }

    markUpToParentNode(node);

    return true;
}

function markUpToParentNode(node)
{
    if(node.parent == null)
    {
        return;
    }

    node.isMarked = true;
    markUpToParentNode(node.parent);
}

/**
 * @param {Node} node 
 */
function findRootNode(node)
{
    if(node.parent == null)
    {
        return node;
    }

    return findRootNode(node.parent);
}

/**
 * @param {Condition} condition 
 * @param {Node} node 
 */
function isPreConditionSatisfied(node)
{
    const actionPreConditions = node.action.getPreConditions();

    if(actionPreConditions.length == 0)
    {
        return true;   
    }

    let preconditionsToSatisfy = [];

    //Check if precondition is satisfied
    for(let i = 0; i < actionPreConditions.length; i++) 
    {
        if(!actionPreConditions[i].evaluate())
        {
            preconditionsToSatisfy.push(actionPreConditions[i]);
        }
    }

    if(preconditionsToSatisfy.length == 0)
    {
        return true;
    }

    //Check if children satisfy precondition.
    for(let i = 0; i < preconditionsToSatisfy.length; i++) {
        let hasPrecondition = false;

        for(let j = 0; j < node.children.length; j++)
        {
            const child = node.children[j];

            const childActionPostConditions = child.action.getPostConditions();

            if(childActionPostConditions.includes(preconditionsToSatisfy[i]))
            {
                hasPrecondition = true;
                break;
            }
        }

        if(hasPrecondition == false) 
        {
            return false;
        }
    }

    return true;
}

/**
 * @param {Condition} condition 
 * @param {Node} node 
 */
function isPostConditionSatisfied(condition, node)
{
    const actionPostConditions = node.action.getPostConditions();

    //Check Post-conditions
    if(actionPostConditions.includes(condition))
    {
        return true;   
    }

    for(let i = 0; i < node.children.length; i++)
    {
        const childNode = node.children[i];
        if(isPostConditionSatisfied(condition, childNode))
        {
            return true;   
        }
    }

    return false;
}

module.exports = Planner;