const mongoose = require("mongoose");

const ChatLogsSchema = mongoose.model({

});

const ChatLogs = new mongoose.model("ChatLogs", ChatLogsSchema);

module.exports = {
    ChatLogs
}