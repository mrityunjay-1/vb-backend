const express = require("express");
const authMiddleware = require("../../middlewares/authMiddleware");
const axios = require("axios");
const { Bot } = require("../../models/bots");

const { QnaTrainingData } = require("../../models/qna-training-data");

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

        res.status(200).send({ message: data });

    } catch (err) {
        console.log("Error in trainBotForQnA route: ", err);
        res.status(500).send({ message: "something went wrong..." });
    }
});

Router.post("/finalDataForQnaTraining", authMiddleware, async (req, res) => {
    try {

        const body = req.body;

        // console.log("body.botId : ", body.botId);

        if (!body || !body?.botId || !body?.qnaData || !Array.isArray(body?.qnaData) || body?.qnaData?.length < 1) {
            throw new Error("proper data not received in request body.");
        }

        // let's prepare data to insert many qna's at once
        let data = body?.qnaData?.map((qna) => ({ botId: body?.botId, question: qna.question, answer: qna.answer })) ?? [];

        console.log("Data : ", data);

        const insertManyResponse = await QnaTrainingData.insertMany(data);

        console.log("insertManyResponse : ", insertManyResponse);

        res.status(200).send({ message: "Data successfully added." });

    } catch (err) {
        console.log("Error in finalDataForQnaTraining route: ", err);
        res.status(500).send({ message: "something went wrong..." });
    }
});

Router.get("/getBotQnaTraningData/:botId", authMiddleware, async (req, res) => {
    try {

        const botId = req?.params?.botId ?? "";

        if (!botId) throw new Error("No bot id found");

        const queries = req.query;

        console.log("quesries: ", queries);

        let limit = 10, skip = 10;

        if (queries && queries.limit && queries.skip) {
            limit = +queries.limit;
            skip = +queries.skip;
        }

        const qnaTrainingData = await QnaTrainingData.find({ botId }).sort({ _id: -1 });

        res.status(200).send(qnaTrainingData);

    } catch (err) {
        console.log("Error in getBotQnaTraningData route: ", err);
        res.status(500).send({ message: "something went wrong..." });
    }
});

Router.post("/createQnA/:botId", authMiddleware, async (req, res) => {
    try {

        const botId = req?.params?.botId;

        if (!botId) throw new Error("Bot Id not received in the url params...");

        const qnaDetails = req.body;

        if (!qnaDetails || !qnaDetails?.question || !Array.isArray(qnaDetails?.question) || qnaDetails?.question?.length < 1 || !qnaDetails?.answer) {
            throw new Error("Expected data not received on the request body...");
        }

        const qna = new QnaTrainingData({
            botId,
            question: qnaDetails.question,
            answer: qnaDetails.answer
        });

        await qna.save();

        res.status(200).send(qna);

    } catch (err) {
        console.log("Error in createQnA route: ", err);
        res.status(500).send({ message: "something went wrong..." });
    }
});

Router.get("/deleteQnA/:qnaId", authMiddleware, async (req, res) => {
    try {

        const qnaId = req?.params.qnaId;

        if (!qnaId) throw new Error("QnA Id not received in url params.");

        const deletedQnARes = await QnaTrainingData.deleteOne({ _id: qnaId });

        if (deletedQnARes?.deletedCount === 0) throw new Error("Could not delete the qna may be id does not exist in the db");

        res.status(200).send({ message: "qna deleted successfully..." });

    } catch (err) {
        console.log("Error in deleteQnA route : ", err);
        res.status(500).send({ message: "something went wrong while deleting the qna" });
    }
});

Router.post("/updateQnA/:qnaId", async (req, res) => {
    try {

        const qnaId = req?.params?.qnaId;

        if (!qnaId) throw new Error("qnaId not received in the url params for updating qna.");

        const updateBody = req.body;

        if (!updateBody) throw new Error("No update body received in the request body to update qna");

        const updatedQnA = await QnaTrainingData.updateOne(
            { _id: qnaId },
            { $set: updateBody },
            { new: true }
        );

        if (!updatedQnA || updatedQnA.modifiedCount < 1) throw new Error("Nothing chaged for modification...");

        res.status(200).send({ message: "QnA successfully updated..." });

    } catch (err) {
        console.log("Error in updateQnA route : ", err);
        res.status(500).send({ message: "something went wrong..." });
    }
});

Router.post("/userRequestedForTraining", async (req, res) => {
    try {

        console.log("User Requested for QnA Training...");
        console.log("Let's Start QnA Training...");

        // now sending this data to ai for training

        // if (!process?.env?.AI_QNA_REMOTE_TRAINING_URL) throw new Error("AI traning remote url not found in the environment variable.");

        // const ai_api_response = await axios.post(process.env.AI_QNA_REMOTE_TRAINING_URL, data);

        // if (!ai_api_response || ai_api_response?.status !== 200 || !ai_api_response?.data) throw new Error("AI response is not 200. something wrong with the AI Qna Training API url.");

        res.status(200).send({ "message": "QnA Training Started..." });

    } catch (err) {
        console.log("Error in userRequestedForTraining route : ", err);
        res.status(500).send({ message: "something went wrong..." });
    }
})

module.exports = Router;