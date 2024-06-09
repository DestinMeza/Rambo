const PROCESS = {
    RUNNING: 0,
    FAILURE: 1,
    SUCCESS: 2
};

function process(self)
{
    if(Game.time - self.startTime <= self.duration)
    {
        return PROCESS.RUNNING;
    }

    return PROCESS.SUCCESS;
}

module.exports = process;