const Action = require("./action");
const Condition = require("./condition");
const Goal = require("./goal");
const GoalEvaluator = require("./goalEvaluator");
const Node = require("./node");
const NodeTree = require("./nodeTree");
const WorldState = require("./worldState");

const maxDepth = 5;

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
            return;    
        }

        //Find best last action
        let lastNode = this.findLastNode(bestGoal, actions);

        this.worldSim = new WorldState();

        let rootNodeWithChildren = this.findPlan(
            bestGoal, 
            actions, 
            lastNode,
            0
        );

        if(rootNodeWithChildren == undefined)
        {
            console.log("No plan could be found.");
            return;
        }
        
        let nodeTree = new NodeTree({
            rootNode: rootNodeWithChildren
        });

        let plannedActions = nodeTree.getActions();

        //Find target plan recursively
        if(plannedActions == undefined || plannedActions.length == 0) {
            console.log("No plan could be found.");
            return;
        }

        return { actions: plannedActions, goal: bestGoal};
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

            for(let conditionKey in bestGoal.postConditions)
            {
                const condition = bestGoal.postConditions[conditionKey];
                
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
     * @param {int} depth 
     */
    findPlan(bestGoal, actions, node, depth)
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
            if(actions[i] == node.action)
            {
                continue;
            }

            if(!this.isChildNodeable(node, actions[i]))
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

            let foundCompletedNode = this.findPlan(bestGoal, newActions, childNode, depth + 1);

            if(foundCompletedNode != undefined)
            {
                let rootNode = this.findRootNode(childNode);
                return rootNode;   
            }
        }

        return undefined;
    }

    /**\
     * @param {Node} parentNode
     * @param {Action} action 
     */
    isChildNodeable(parentNode, action)
    {
        return parentNode.evaluateNode(this.worldSim, action);
    }

    /**
     * 
     * @param {Goal} bestGoal
     * @param {Node} node 
     */
    isGoalSatisfied(bestGoal, node)
    {
        let rootNode = this.findRootNode(node);

        //Check from root down tree if post conditions are met.
        for(let i = 0; i < bestGoal.postConditions.length; i++)
        {
            const condition = bestGoal.postConditions[i];
            if(!this.isPostConditionSatisfied(condition, rootNode))
            {
                return false
            }
        }

        //Check if last node conditions satisfied.
        if(!this.isPreConditionSatisfied(node))
        {
            return false;
        }

        this.markUpToParentNode(node);

        return true;
    }

    markUpToParentNode(node)
    {
        if(node.parent == null)
        {
            return;
        }

        node.isMarked = true;
        this.markUpToParentNode(node.parent);
    }

    /**
     * @param {Node} node 
     */
    findRootNode(node)
    {
        if(node.parent == null)
        {
            return node;
        }

        return this.findRootNode(node.parent);
    }

    /**
     * @param {Condition} condition 
     * @param {Node} node 
     */
    isPreConditionSatisfied(node)
    {
        if(node.action.preConditions.length == 0)
        {
            return true;   
        }

        let preconditionsToSatisfy = [];

        //Check if precondition is satisfied
        for(let i = 0; i < node.action.preConditions.length; i++) 
        {
            if(!node.action.preConditions[i].evaluate())
            {
                preconditionsToSatisfy.push(node.action.preConditions[i]);
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

                if(child.action.postConditions.includes(preconditionsToSatisfy[i]))
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
     * 
     * @param {Condition} condition 
     * @param {Node} node 
     */
    isPostConditionSatisfied(condition, node)
    {
        //Check Post-conditions
        if(node.action.postConditions.includes(condition))
        {
            return true;   
        }

        for(let i = 0; i < node.children.length; i++)
        {
            const childNode = node.children[i];
            if(this.isPostConditionSatisfied(condition, childNode))
            {
                return true;   
            }
        }

        return false;
    }
}

module.exports = Planner;