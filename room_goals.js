const ROOM_CONDITIONS = require("./room_conditions");

const ROOM_GOALS = {
    Collect_Energy:
    {
        name: "Collect_Energy",
        getPriority: (value) => value,
        preConditions: [],
        postConditions: [ROOM_CONDITIONS.Energy_At_MaxCapacity.name]
    }
}

module.exports = ROOM_GOALS;