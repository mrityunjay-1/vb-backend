const express = require("express");
const authMiddleware = require("../../middlewares/authMiddleware");
const axios = require("axios");
const { Bot } = require("../../models/bots");

const { multerMemoryStorage } = require("../../utils/multerHelper");
const { readDataFromXlsxFileBuffer } = require("../../utils/xlsxReadFile");

const Router = express.Router();

Router.post("/trainBotForQnA", authMiddleware, multerMemoryStorage.single("qna_data_file"), async (req, res) => {
    try {

        const body = req?.body;

        if (!body || !body?.botId) throw new Error("Invalid body received.");

        const bot = await Bot.findOne({ botId: body.botId });

        if (!bot) throw new Error("Bot not found with given id.");

        if (!req?.file?.buffer) throw new Error("File not received in the body");

        // getting sheet data from uploaded file by user using readDataFromXlsxFileBuffer helper function
        const sheetData = readDataFromXlsxFileBuffer(req.file.buffer);

        if (!sheetData || sheetData?.length === 0) throw new Error("Error while reading the data from xlsx file.");

        // Let's verify the data
        const errorInRows = [];

        sheetData.forEach((row, index) => {
            if (!row?.question) errorInRows.push(`Question cell is empty at row number : ${index + 2}`);
            if (!row?.answer) errorInRows.push(`Answer cell is empty at row number : ${index + 2}`);
        });

        if (Array.isArray(errorInRows) && errorInRows?.length > 0) {
            return res.status(400).send({ message: errorInRows.join("\n") });
        }

        // getting only question and answer column from sheet data
        // I know, i am doing more computation here but yes when user sees this data they will amazed
        const data = { botId: body.botId };

        data.data = sheetData.map((row) => ({ question: row.question, answer: row.answer }));

        // now sending this data to ai for training

        // if (!process?.env?.AI_QNA_REMOTE_TRAINING_URL) throw new Error("AI traning remote url not found in the environment variable.");

        // const ai_api_response = await axios.post(process.env.AI_QNA_REMOTE_TRAINING_URL, data);

        // if (!ai_api_response || ai_api_response?.status !== 200 || !ai_api_response?.data) throw new Error("AI response is not 200. something wrong with the AI Qna Training API url.");

        res.status(200).send({ message: data });

    } catch (err) {
        console.log("Error in trainBotForQnA route: ", err);
        res.status(500).send({ message: "something went wrong..." });
    }
});

Router.post("/finalDataForQnaTraining", authMiddleware, async (req, res) => {
    try {

        const body = req.body;

        res.status(200).send({ message: body });

    } catch (err) {
        console.log("Error in finalDataForQnaTraining route: ", err);
        res.status(500).send({ message: "something went wrong..." });
    }
})

module.exports = Router;