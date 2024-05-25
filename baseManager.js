const RoomEvaluator = require("./roomEvaluator");
const FortressBlueprint = require("./fortress");

class BaseManager {
    constructor() {
        this.blueprints = [FortressBlueprint];
    }

    showVisual(roomName)
    {
        RoomEvaluator.test_EvaluateRoom(roomName);
    }

    evaluateRoom(roomName)
    {
        RoomEvaluator.evaluateRoom(roomName);
    }

    createBase(roomName)
    {
        
    }
}

module.exports = BaseManager;