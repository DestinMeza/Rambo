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
     * @param {Action} potentialChildAction
     */
    evaluateNode(potentialChildAction){

        //This is only for actions that's children dynamically set properties in the next action chain.
        if(potentialChildAction.possibleActionChildren != undefined && potentialChildAction.possibleActionChildren.length > 0)
        {

            if(!potentialChildAction.possibleActionChildren.includes(this.action.name))
            {
                return false;
            }
        }

        //Check through world state simulation

        //TODO Reimplement.
        //WorldState.simulateStateChange(this.action.effects);

        let simPostConditions = potentialChildAction.getPostConditions();
        let simPreConditions = this.action.getPreConditions();
        let notMetConditions = [];

        //Find potential all non met conditions in with child.
        for(let i = 0; i < simPostConditions.length; i++)
        {
            const condition = simPostConditions[i];

            if(!simPreConditions.includes(condition))
            {
                notMetConditions.push(condition);
            }
        }

        if(notMetConditions.length > 0)
        {
            return false;
        }

        //Check if non met conditions are satisfied
        for(let i = 0; i < notMetConditions.length; i++)
        {
            const condition = notMetConditions[i];

            if(condition.evaluate() == false)
            {
                return false;
            }
        }
        
        //worldSim.process(); //Reset State
        return true;
    }

    print()
    {
        let children = [this.action.name];

        for(let i = 0; i < this.children.length; i++)
        {
            children.push(this.children[i].print());
        }

        return children;
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