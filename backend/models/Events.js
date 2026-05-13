const mongoose = require("mongoose");

const eventschema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    capacity: {
        type: Number,
        required: true,
    },
    registeredCount: {
        type: Number,
        default: 0,
    },
    time: {
        type: String,
        required: true
    },

})
module.exports = mongoose.model("Event", eventschema);