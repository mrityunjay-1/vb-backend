const mongoose = require("mongoose");

const ChatLogsSchema = mongoose.Schema({
    logs: [{}]
});

const ChatLogs = new mongoose.model("ChatLogs", ChatLogsSchema);

module.exports = {
    ChatLogs
}