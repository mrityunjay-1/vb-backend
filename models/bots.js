const mongoose = require("mongoose");

const BotSchema = mongoose.Schema({
    botName: {
        type: String,
        required: true
    },
    botIcon: {
        type: String
    },
    botId: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {
    timestamps: true
});

const Bot = new mongoose.model("Bot", BotSchema);

module.exports = {
    Bot
}