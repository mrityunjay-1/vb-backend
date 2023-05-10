const mongoose = require("mongoose");

const QnaTrainingDataSchema = mongoose.Schema({
    botId: {
        type: String,
        required: true
    },
    question: [{
        type: String
    }],
    answer: {
        type: String,
        required: true
    },
    language: [{
        type: String,
        default: "en"
    }]
}, {
    timestamps: true
});

const QnaTrainingData = new mongoose.model("QnaTrainingData", QnaTrainingDataSchema);

module.exports = {
    QnaTrainingData
}