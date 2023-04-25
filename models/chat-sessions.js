const mongoose = require("mongoose");

const ChatSessionsSchema = mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    roomName: String,
    socketId: String,
    startDateTime: Number,
    web_call_id: String,
    userType: String,
    chat_logs: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ChatLogs"
    }
}, {
    timestamps: true
});

const ChatSessions = new mongoose.model("ChatSessions", ChatSessionsSchema);

module.exports = {
    ChatSessions
}