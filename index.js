const express = require("express");
const cors = require("cors");
const audioRouter = require("./voice-recorder");
const socketIO = require("socket.io");
const axios = require("axios");
const { addUser, getUser, removeUser, users } = require("./manageUsers");

const fs = require("fs");
const path = require("path");

const http = require("http");
const app = express();
const server = http.createServer(app);

const io = socketIO(server, {
    cors: {
        origin: "*"
    }
});

io.on("connection", (socket) => {
    console.log(socket.id);

    socket.emit("greeting", "Hello from VB Backend");

    socket.on("join_room", (userDetails) => {
        addUser({ socketId: socket.id, roomName: userDetails.roomName, socket });
    })

    socket.on("start_call", () => {

    });

    socket.on("recording", async (recording) => {

        console.log("recording: ", recording);

        // call ai api here to pass audio data:
        // const ai_api_res = await axios.post("http://localhost:6000/njsdata", {
        //     socketId: socket.id,
        //     audioData: recording.audioData
        // });

        // console.log("AI API response: ", ai_api_res);

    });

});

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.status(200).send({ status: 200, message: "welcome to voice bot..." });
});

app.post("/vb-response", (req, res) => {
    try {

        const user = getUser(req.body.socketId ?? "", req.body.roomName);

        if (!user) throw new Error("No user found...");

        console.log("found user of vb-response: ", user);

        user.socket.emit("vb-response", "vb-response");

        res.status(200).send({ message: "OK" });

    } catch (err) {
        console.log("Error in sending response to user : ", err);
        res.status(500).send({ message: err.message });
    }
});

app.use("/", express.static(path.join(__dirname, "../sessions")));

app.get("/getAllTheSessions", (req, res) => {
    const data = fs.readdirSync(path.join(__dirname, "../sessions"));
    res.status(200).send(data);
});

app.get("/getSession/:folder", (req, res) => {

    const param = req.params.folder;

    // let data = fs.readdirSync(path.join(__dirname, "../sessions/" + param));
    // data = data.map((d) => ("http://localhost:8080/" + param + "/" + d));

    const transcription_path = path.join(__dirname, "../transcriptions/" + param + ".json");

    let transcription_data = require(transcription_path);

    let chat_session_data = [];

    for (const [key, _value] of Object.entries(transcription_data)) {

        let obj = {
            "user": {
                time: key,
                text: transcription_data[key]["User"],
                audio: "http://localhost:8080/" + param + "/" + "user_" + key + ".wav"
            },
            "bot": {
                time: key,
                text: transcription_data[key]["Bot"],
                audio: "http://localhost:8080/" + param + "/" + "bot_" + key + ".mp3"
            }
        };

        chat_session_data.push(obj);

    }

    res.status(200).send(chat_session_data);
});

app.use("/audio", audioRouter);

// console.log(path.join(__dirname, "./sessions"));

// let files_output = [];

// const getAllTheFiles = (dirname) => {

//     // let path_main = path.join(dirname);

//     const files = fs.readdirSync(dirname);

//     if (files.length > 0) {

//         for (let i = 0; i < files.length; ++i) {

//             let folder_path = dirname + "/" + files[i];

//             if (fs.lstatSync(folder_path).isDirectory()) {

//                 getAllTheFiles(folder_path);
//             } else {
//                 files_output.push(folder_path);
//             }

//         }
//     }

// }

// getAllTheFiles(path.join(__dirname, "sessions"));
// console.log(files_output);

server.listen(8080, () => {
    console.log("Server is up and running on port: ", 8080);
});