const Task = require("./task");
const Tasks = require("./tasks");

class CreepRunner
{
    static run()
    {
        for(const creep in Game.creeps)
        {
            let task = Game.creeps[creep].memory.task;

            if(task == undefined)
            {
                continue;
            }

            let processFunc = Tasks[task.name];

            if(typeof processFunc != "function")
            {
                console.log("Task name does not exist in Task Manager.", task.name);
                continue;
            }

            Game.creeps[creep].memory.task = processFunc(task);
        }
    }
}

module.exports = CreepRunner