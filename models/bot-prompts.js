const mongoose = require("mongoose");

const botPromptSchema = mongoose.Schema({
    prompts: [],
    botId: String,
    owner: {
        ref: "User",
        type: mongoose.Schema.Types.ObjectId
    }
});

const BotPrompt = new mongoose.model("BotPrompt", botPromptSchema);

module.exports = {
    BotPrompt
}