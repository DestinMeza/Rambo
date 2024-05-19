class Condition {
    constructor(info)
    {
        this.name = info.name;
        this.condition = () => info.condition;
    }

    evaluate()
    {
        let condition = this.condition();

        return condition;
    }
}

module.exports = Condition;