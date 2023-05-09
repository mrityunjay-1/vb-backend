/**
 * Purpose of this router file is to handle all the requests regarding bot createion, deletion, update, read and all
 */

const express = require("express");
const { Bot } = require("../models/bots");
const authMiddleware = require("../middlewares/authMiddleware");
const { v4 } = require("uuid");

const Router = express.Router();

Router.post("/createBot", authMiddleware, async (req, res) => {
    try {

        const body = req.body;

        if (!body || !body?.botName) throw new Error("Required fields not received in request body.");

        const bot = new Bot({
            botName: body.botName,
            botId: v4(),
            owner: req.user._id,
            ownersTenantId: body.tenantId
        });

        await bot.save();

        req.user.bots = [...req.user.bots, bot._id];
        await req.user.save();

        res.status(200).send({ message: "bot created..." });

    } catch (err) {
        console.log("Error while creating bot: ", err);
        res.status(500).send({ message: "Something went wrong..." });
    }
});

Router.get("/getAllBots", authMiddleware, async (req, res) => {
    try {

        const user = await req.user.populate("bots", "_id botName botId");

        res.status(200).send(user.bots);

    } catch (err) {
        console.log("Error in getAllBots route: ", err);
        res.status(500).send({ message: "Something went wrong..." });
    }
});

Router.post("/getBotDetails/:botId", authMiddleware, async (req, res) => {
    try {

    } catch (err) {
        console.log("Error in getBotDetails route: ", err);
        res.status(500).send({ message: "Something went wrong..." });
    }
});

Router.post("/updateBot/:botId", authMiddleware, async (req, res) => {
    try {

    } catch (err) {
        console.log("Error in updateBot route: ", err);
        res.status(500).send({ message: "Something went wrong..." });
    }
});

Router.get("/deleteBot/:botId", authMiddleware, async (req, res) => {
    try {

        // Here botId refers to _id of bot's document
        const botId = req?.params?.botId;

        if (!botId) throw new Error("No bot id received in the request url...");

        const botDeleteRes = await Bot.deleteOne({ _id: botId });

        if (botDeleteRes.deletedCount < 1) throw new Error("Bot Could not be deleted as there is no bot found with the passed bot id.");

        req.user.bots = req.user.bots.filter((bid) => bid != botId);
        await req.user.save();

        res.status(200).send({ message: "Bot successfully deleted" });

    } catch (err) {
        console.log("Error in deleteBot route: ", err);
        res.status(500).send({ message: "Something went wrong..." });
    }
});

module.exports = Router;