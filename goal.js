class Goal {

    constructor(info)
    {
        this.name = info.name;
        this.priority = info.priority;
        this.room = info.room;
        this.preConditions = info.preConditions;
        this.postConditions = info.postConditions;
        this.getPreConditions = info.getPreConditions;
        this.getPostConditions = info.getPostConditions;
    }
}

module.exports = Goal;