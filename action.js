class Action {
    constructor(info)
    {
        this.name = info.name;
        this.cost = info.cost;
        this.room = info.room;
        this.hasStarted = false;
        this.possibleActionChildren = info.possibleActionChildren;
        this.preConditions = info.preConditions;
        this.postConditions = info.postConditions;
        this.effects = info.effects;
        this.getPreConditions = info.getPreConditions;
        this.getPostConditions = info.getPostConditions;

        this.process = (x) => info.process(x);
        this.start = (x) => info.start(x);

        if(info.data == undefined)
        {
            return;
        }

        for(let dataKey in info.data)
        {
            this[dataKey] = info.data[dataKey];   
        }
    }
}

module.exports = Action;