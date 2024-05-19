class Goal {

    constructor(info)
    {
        this.name = info.name;
        this.priority = info.priority;
        this.conditions = info.conditions;
    }
}

module.exports = Goal;