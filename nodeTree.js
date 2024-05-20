const Node = require("./node")

class NodeTree
{
    /**
     * @param {Object} info 
     * @param {Node} info.node
     */
    constructor(info)
    {
        this.rootNode = info.rootNode;
    }

    getActions()
    {
        let nodeStack = this.getChildrenNodes(this.rootNode, [this.rootNode]);
        let nodeChainStartToEndPlan = nodeStack.reverse();

        let actions = [];
        nodeChainStartToEndPlan.forEach(node => {
            actions.push(node.action);
        });

        return actions;
    }

    /**
     * @param {Node} node 
     * @param {Node[]} nodeStack
     */
    getChildrenNodes(node, nodeStack)
    {
        node.children.forEach(childNode => {
            if(childNode.isMarked)
            {
                nodeStack.push(childNode);
                this.getChildrenNodes(childNode, nodeStack);
            }
            return nodeStack;
        });

        return nodeStack;
    }
}

module.exports = NodeTree;