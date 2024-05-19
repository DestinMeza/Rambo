function process(objectInfo)
{
    if(objectInfo.startTime == undefined)
    {
        objectInfo.startTime = Game.time;
    }

    if(Game.time - objectInfo.startTime < objectInfo.duration)
    {
        return PROCESS.RUNNING;
    }

    return PROCESS.SUCCESS;
}

module.exports = process;