class Goal {

    constructor(info)
    {
        this.name = info.name;
        this.priority = info.priority;
        this.preConditions = info.preConditions;
        this.postConditions = info.postConditions;
    }
}

module.exports = Goal;