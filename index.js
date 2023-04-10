const express = require("express");
const cors = require("cors");
const socketIO = require("socket.io");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const http = require("http");
require("dotenv").config();

const { addUser, getUser, removeUser, users } = require("./manageUsers");
const audioRouter = require("./voice-recorder");

const BOT_NAME = process?.env?.BOT_NAME ?? "";
if (!BOT_NAME) process.exit(1);

const app = express();
const server = http.createServer(app);

app.use(
  "/",
  express.static(path.join(__dirname, "../../projects/sound_recordings"))
);
app.use(
  "/",
  express.static(`../../projects/audio_files_${BOT_NAME}`)
);

const io = socketIO(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  // console.log(socket.id);

  socket.emit("greeting", {
    message: "Hello from VB Backend",
    socketId: socket.id,
  });

  socket.on("join_room", (userDetails) => {
    try {
      console.log("Joining user in a room : ", userDetails);

      if (
        !(
          userDetails &&
          userDetails.name &&
          userDetails.phone &&
          userDetails.email
        )
      ) {
        console.log("proper details of user not received at backend...");
        return;
      }

      addUser({
        socketId: socket.id,
        roomName: userDetails.roomName,
        web_call_id: userDetails.roomName,
      });

      // fs.writeFileSync(
      //   path.join(__dirname, `./user_details/${socket.id}.json`),
      //   JSON.stringify(userDetails, null, 4),
      //   "utf-8"
      // );

      console.log(users);
    } catch (err) {
      console.log("Erorr while joining the room. Err: ", err);
    }
  });

  socket.on("start_call", () => { });

  socket.on("recording", async (recording) => {
    // console.log("recording: ", recording);

    // console.log("users : ", users);

    // call ai api here to pass audio data:
    const ai_api_res = await axios.post(process.env.AI_SERVER_URL, {
      web_call_id: socket.id,
      audioData: recording.audioData,
    });

    console.log("AI API response: ", ai_api_res);
  });

  socket.on("disconnect", () => {
    console.log("koi to gaya hai connection tod ke.");
    console.log("uski id = ", socket.id);
    removeUser(socket.id);
  });
});

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.status(200).send({ status: 200, message: "welcome to voice bot..." });
});

app.post("/responseHook", (req, res) => {
  try {
    const user = getUser(req.body.web_call_id ?? "", req.body.web_call_id);

    if (!user) throw new Error("No user found...");

    // console.log("found user of vb-response: ", user);

    console.log(
      "process.env.SERVER_URL + req.body.file_name : ",
      process.env.SERVER_URL + "/" + req.body.file_name
    );

    if (!req.body.file_name) {
      throw new Error("file name not received...");
    }

    io.to(req.body.web_call_id).emit("vb-response", {
      response: req.body.response,
      file_name: req.body.file_name,
      volume: req.body.volume ?? 0.8,
      bot_name: req?.body?.bot_name ?? "",
      audio_file_url: process.env.SERVER_URL + "/" + req.body.file_name,
      lang: req.body.lang ?? "en",
      rate: req.body.rate ?? 1,
      pitch: req.body.pitch ?? 1,
    });

    res.status(200).send({ message: "OK" });
  } catch (err) {
    console.log("Error in sending response to user : ", err);
    res.status(500).send({ message: err.message });
  }
});

app.get("/getAllTheSessions", (req, res) => {
  try {
    const data = fs.readdirSync(
      path.join(__dirname, "../../projects/sound_recordings")
    );

    let sessions = [];

    for (const session of data) {
      let obj = {
        id: session,
      };

      let isUserDataFileExists = "";

      try {
        isUserDataFileExists = require.resolve(
          `./user_details/${session}.json`
        );
      } catch (err) {
        console.log("err while resolving the module...", err);
      }

      if (isUserDataFileExists) {
        obj.user_details = require(`./user_details/${session}.json`);
      }

      sessions.push(obj);
    }

    sessions = sessions.sort((a, b) => {
      return +b.user_details.startDateTime - +a.user_details.startDateTime
    });

    res.status(200).send(sessions);
  } catch (err) {
    console.log("err: ", err);
  }
});

app.get("/getSession/:folder", (req, res) => {
  const param = req.params.folder;

  // let data = fs.readdirSync(path.join(__dirname, "../sessions/" + param));
  // data = data.map((d) => ("http://localhost:9000/" + param + "/" + d));

  // const transcription_path = path.join(__dirname, "../../projects/transcriptions/" + param + ".json");

  let transcription_data = require("../../projects/outputs/" + param + ".json");

  let chat_session_data = [];

  for (const [key, _value] of Object.entries(transcription_data)) {
    let obj = {
      user: {
        time: key,
        text: transcription_data[key]["User"],
        audio: "http://localhost:9000/" + param + "/" + "user_" + key + ".wav",
      },
      bot: {
        time: key,
        text: transcription_data[key]["Bot"],
        audio: "http://localhost:9000/" + param + "/" + "bot_" + key + ".mp3",
      },
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

const PORT = process.env.PORT || 9000;
server.listen(PORT, () => {
  console.log("Server is up and running on port: ", PORT);
});
