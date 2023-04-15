const mongoose = require("mongoose");

const ChatLogsSchema = mongoose.model({
    logs: [{}]
});

const ChatLogs = new mongoose.model("ChatLogs", ChatLogsSchema);

module.exports = {
    ChatLogs
}