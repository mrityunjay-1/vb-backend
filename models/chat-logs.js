const mongoose = require("mongoose");

const ChatLogsSchema = mongoose.Schema({
    chat_session: String,
    logs: [{}]
});

const ChatLogs = new mongoose.model("ChatLogs", ChatLogsSchema);

module.exports = {
    ChatLogs
}