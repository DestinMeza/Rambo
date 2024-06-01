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
    }
}

module.exports = Task;