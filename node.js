const Action = require("./action");
const WorldState = require("./worldState");

class Node
{
    /**
     * @param {Object} info 
     * @param {Action} info.action
     * @param {bool} info.isMarked
     */
    constructor(info)
    {
        this.parent = info.parent;
        this.action = info.action;
        this.isMarked = info.isMarked;
        this.children = [];
    }

    /**
     * @param {WorldState} worldSim
     * @param {Action} observerAction
     */
    evaluateNode(worldSim, observerAction){
        let simAction = Object.assign({}, this.action);
        worldSim.simulateStateChange(simAction.effects);

        let simPostConditions = worldSim.actionPostConditionMap[simAction.name];
        let simPreConditions = worldSim.actionPreConditionMap[observerAction.name];

        //Check if conditions are included.
        simPreConditions.forEach(condition => {
            if(!simPostConditions.includes(condition))
            {
                worldSim.process(); //Reset State
                return false;
            }
        });

        //Check if conditions are evaluated as True
        simPreConditions.forEach(condition => {
            if(!condition)
            {
                worldSim.process(); //Reset State
                return false;
            }
        });

        worldSim.process(); //Reset State
        return true;
    }

    /**
     * @param {Node} node
     */
    addChild(node)
    {
        this.children.push(node);
    }
}

module.exports = Node;