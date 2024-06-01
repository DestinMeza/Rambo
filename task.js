class Task
{
    constructor(info)
    {
        this.name = info.name;
        this.creepName = info.creepName;
        this.state = 0;

        for(let key in info.data)
        {
            this[key] = info.data[key];
        }
    }
}

module.exports = Task;