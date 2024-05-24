const RoomEvaluator = require("./roomEvaluator");

class BaseManager {
    constructor() {

    }

    showVisual()
    {
        RoomEvaluator.evaluateRoom("sim");
    }
}

module.exports = BaseManager;