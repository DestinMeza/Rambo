class Action {
    constructor(info)
    {
        this.name = info.name;
        this.hasStarted = false;
        this.preConditions = info.preConditions;
        this.postConditions = info.postConditions;
        this.effects = info.effects;
        this.cost = info.cost;
        this.process = (x) => info.process(x);
        this.start = (x) => info.start(x);

        if(info.data == undefined)
        {
            info.data = null;
            return;
        }

        for(let dataKey in info.data)
        {
            this[dataKey] = info.data[dataKey];   
        }
    }
}

module.exports = Action;