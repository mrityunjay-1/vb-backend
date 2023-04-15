const mongoose = require("mongoose");

const ChatSessionsSchema = mongoose.model({

});

const ChatSessions = new mongoose.model("ChatSessions", ChatSessionsSchema);

module.exports = {
    ChatSessions
}