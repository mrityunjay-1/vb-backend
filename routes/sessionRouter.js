const express = require("express");
const Router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");

const { ChatSessions } = require("../models/chat-sessions");
const { ChatLogs } = require("../models/chat-logs");

const { getSessionDetails } = require("../helperActions");

// Router.use(authMiddleware);

Router.get("/getAllTheSessions", authMiddleware, async (req, res) => {
    try {
        // const data = fs.readdirSync(
        //   path.join(__dirname, "../../projects/sound_recordings")
        // );

        // let sessions = [];

        // for (const session of data) {
        //   let obj = {
        //     id: session,
        //   };

        //   let isUserDataFileExists = "";

        //   try {
        //     isUserDataFileExists = require.resolve(
        //       `./user_details/${session}.json`
        //     );
        //   } catch (err) {
        //     console.log("err while resolving the module...", err);
        //   }

        //   if (isUserDataFileExists) {
        //     obj.user_details = require(`./user_details/${session}.json`);
        //   }

        //   sessions.push(obj);
        // }

        // sessions = sessions.sort((a, b) => {
        //   return +b?.user_details?.startDateTime - +a?.user_details?.startDateTime
        // });

        let { limit, skip } = req.query;

        if (!(limit?.toString() && skip?.toString())) {
            limit = 1000;
            skip = 0;
        }

        const sessions = await ChatSessions.find().sort({ _id: -1 }).limit(limit).skip(skip);

        res.status(200).send(sessions);

    } catch (err) {
        console.log("Error in getAllTheSessions route: ", err);
        res.status(500).send({ message: "something went wrong..." });
    }
});

Router.get("/getSession/:socketId", authMiddleware, async (req, res) => {
    try {

        const socketId = req?.params?.socketId;

        if (!socketId) throw new Error("no socket id received to retrieve the chat logs...");

        // let data = fs.readdirSync(path.join(__dirname, "../sessions/" + param));
        // data = data.map((d) => ("http://localhost:9000/" + param + "/" + d));
        // const transcription_path = path.join(__dirname, "../../projects/transcriptions/" + param + ".json");

        const chat_session_data = getSessionDetails(socketId);

        // const sessionDetails = await ChatLogs.findOne({ chat_session: socketId });

        res.status(200).send(chat_session_data);

    } catch (err) {
        console.log("Error in getsession: ", err);
        res.status(500).send({ message: "something went wrong..." });
    }
});

module.exports = Router;