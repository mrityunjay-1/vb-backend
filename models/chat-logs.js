const mongoose = require("mongoose");

const ChatLogsSchema = mongoose.Schema({
    chat_session: String,
    logs: [{}]
}, {
    timestamps: true
});

const ChatLogs = new mongoose.model("ChatLogs", ChatLogsSchema);

module.exports = {
    ChatLogs
}