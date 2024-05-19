const TaskManager = require("./taskManager");

class CreepRunner
{
    static run()
    {
        let taskManager = new TaskManager();

        for(const creep in Game.creeps)
        {
            let task = Game.creeps[creep].memory.task;

            if(task == undefined)
            {
                continue;
            }

            let processFunc = taskManager.taskMap[task.name];

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