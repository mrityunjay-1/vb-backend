const mongoose = require("mongoose");

const QnaTrainingDataSchema = mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    },
    language: {
        type: String,
        default: "en"
    }
}, {
    timestamps: true
});

const QnaTrainingData = new mongoose.model("QnaTrainingData", QnaTrainingDataSchema);

module.exports = {
    QnaTrainingData
}