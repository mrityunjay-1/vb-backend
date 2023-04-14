const mongoose = require("mongoose");
require("../db/db_connectivity");

const LiveUserSchema = mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    roomName: String,
    socketId: String,
    startDateTime: Number,
    web_call_id: String,
    userType: String
});

const LiveUser = new mongoose.model("LiveUser", LiveUserSchema);

module.exports = {
    LiveUser
}