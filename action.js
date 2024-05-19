class Action {
    constructor(info)
    {
        this.name = info.name
        this.conditions = info.conditions;
        this.process = () => info.process();
    }
}

module.exports = Action;