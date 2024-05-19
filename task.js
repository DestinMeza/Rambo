class Task
{
    constructor(info)
    {
        this.name = info.name;
        this.creep = info.creep;

        for(let key in info.data)
        {
            this[key] = info.data[key];
        }

        Game.creeps[this.creep].memory.task = this;
    }
}

module.exports = Task;