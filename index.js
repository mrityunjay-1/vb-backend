const express = require("express");
const cors = require("cors");
const socketIO = require("socket.io");

// const ws = require("ws");

const axios = require("axios");
const fs = require("fs");
const path = require("path");
const http = require("http");
const chokidar = require("chokidar");

const { getSessionDetails } = require("./helperActions");

require("dotenv").config();

const { addUser, getUser, getAllUsers, removeUser, getUserRoomBySocketId } = require("./manageUsers");
// const audioRouter = require("./voice-recorder");
const { ChatSessions } = require("./models/chat-sessions");

// Routers
const userRouter = require("./routes/userRouter");
const sessionRouter = require("./routes/sessionRouter");
const AiQnATrainingRouter = require("./routes/aiTrainings/qna_training");
const botRouter = require("./routes/botRouter");

const BOT_NAME = process?.env?.BOT_NAME ?? "";
if (!BOT_NAME) process.exit(1);

const app = express();
const server = http.createServer(app);

const sound_recordings_path = path.join(__dirname, "../../projects/sound_recordings");
const audio_files_path = `../../projects/audio_files/${BOT_NAME}`;

app.use("/", express.static(sound_recordings_path));
app.use("/", express.static(audio_files_path));


// socket.io hu mai

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

  // let i = 0;

  // socket.on("audio", (audioStream) => {

  //   console.log("audioStream: ",  audioStream);

  //   fs.appendFileSync("abcd.txt", ("," + (JSON.stringify(audioStream)).replace("[", "").replace("]", "")));

  //   console.log(i++);

  //   if (i === 20) {
  //     process.exit(1);
  //   }
  // });

  socket.on("join_room", async (userDetails) => {
    try {

      console.log("Joining user in a room : ", userDetails);

      if (userDetails && userDetails.userType === "user" && userDetails.roomName && userDetails.name && userDetails.phone && userDetails.email) {

        socket.join(userDetails.roomName);

        await addUser({
          socketId: socket.id,
          roomName: userDetails.roomName,
          web_call_id: socket.id,
          ...userDetails
        });

      }
      else if (userDetails && userDetails.userType === "agent" && userDetails.roomName) {

        socket.join(userDetails.roomName);

        await addUser({
          socketId: socket.id,
          roomName: userDetails.roomName,
          web_call_id: socket.id,
          ...userDetails
        });

      } else {

        console.log("proper details of user not received at backend...");
        return;
      }

      const all_users = await getAllUsers();
      io.emit("showliveUsers", all_users);

    } catch (err) {
      console.log("Erorr while joining the room. Err: ", err);
    }
  });

  socket.on("start_call", () => { });

  socket.on("audioStream", async (recording) => {
    try {

      // console.log("recording: ", recording);

      // Checking all the required parameters to start conversation
      if (!socket?.id || !recording?.audioData || recording?.audioData?.length === 0 || !process?.env?.AI_RECV_TYPE) {
        throw new Error("No Proper Data received for starting conversation.");
      }

      if (!recording?.botId) {
        recording.botId = "";
      }

      io.emit("webrecorder", {
        webCallId: socket?.id ?? "",
        botId: recording?.botId ?? "",
        audioData: recording?.audioData ?? [],
        recv_type: process?.env?.AI_RECV_TYPE ?? ""
      });

    } catch (err) {
      console.log("Error in audioStream socket event Listener: ", err);
    }

  });

  socket.on("recording", async (recording) => {
    // console.log("recording: ", recording);

    // console.log("users : ", users);

    // call ai api here to pass audio data:
    // const ai_api_res = await axios.post(process.env.AI_SERVER_URL, {
    //   web_call_id: socket.id,
    //   audioData: recording.audioData,
    // });

    // console.log("AI API response: ", ai_api_res);

    try {

      io.emit("webrecorder", {
        webCallId: socket.id,
        audioData: recording.audioData,
        recv_type: process?.env?.AI_RECV_TYPE ?? "NA"
      });

    } catch (err) {
      console.log("Error: ", err);
    }

  });

  // socket.on("responseHook", (body) => {

  //   io.to(body.web_call_id).emit("vb-response", {
  //     response: body.response,
  //     file_name: body.file_name,
  //     volume: body.volume ?? 0.8,
  //     bot_name: req?.body?.bot_name ?? "",
  //     audio_file_url: process.env.SERVER_URL + "/" + body.file_name,
  //     lang: body.lang ?? "en",
  //     rate: body.rate ?? 1,
  //     pitch: body.pitch ?? 1,
  //   });

  // });

  socket.on("disconnect_call", async ({ socketId }) => {
    try {
      console.log("Disconnect call request by socket id = ", socket.id);

      await removeUser(socketId);

      const users = await getAllUsers();
      io.emit("showliveUsers", users);

    } catch (err) {
      console.error("Error while user disconnection of call : ", err);
    }
  });

  socket.on("getLiveUsers", async () => {
    try {
      const users = await getAllUsers();
      io.emit("showliveUsers", users);
    } catch (err) {
      console.log("Error: ", err);
    }
  });

  socket.on("disconnect", async () => {
    try {
      await removeUser(socket.id);

      const users = await getAllUsers();
      io.emit("showliveUsers", users);

    } catch (err) {
      console.log("error: ", err);
    }
  });

});

// ws hu mai
// const wss = new ws.Server({server});

// wss.on("connection", (socket) => {
//   console.log("Socket connection received over ws : ", socket.id);
// });

app.use(express.json());
app.use(cors());
app.use("/", userRouter);
app.use("/", sessionRouter);
app.use("/", AiQnATrainingRouter);
app.use("/", botRouter);

// Watcher for live feed update
const watcher = chokidar.watch("../../projects/outputs", { persistent: true });

watcher.on("change", async (path) => {

  if (path.endsWith(".json")) {

    const changed_file_data = require(path);

    const file_name = path?.split("/")?.slice(-1).join("");

    if (!file_name) {
      console.log("no file name received.");
      return;
    }

    let socketId = file_name?.replace(".json", "");

    console.log("socket ID: ", socketId);

    const { roomName } = await getUserRoomBySocketId(socketId);

    if (roomName) {
      console.log("Yay! Room name mil gaya...", roomName);

      const chat_session_data = getSessionDetails(socketId);

      // Yaha data emit karna hai ab bas

      io.emit("liveBroadcastChatData", { roomName, socketId, chat_session_data });

    } else {
      console.log("Nahi! roomname nahi mila with this socket id: ", socketId);
    }

  }

});

app.get("/", (req, res) => {
  res.status(200).send({ status: 200, message: "welcome to voice bot..." });
});

app.post("/responseHook", async (req, res) => {
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

    const { roomName } = await getUserRoomBySocketId(req.body.web_call_id);

    io.to(roomName).emit("vb-response", {
      response: req.body.response, // no-use as of now
      file_name: req.body.file_name, // no-use as of now
      volume: req.body.volume ?? 0.8, // no-use as of now
      bot_name: req?.body?.bot_name ?? "",
      audio_file_url: process.env.SERVER_URL + "/" + req.body.file_name,
      lang: req.body.lang ?? "en", // no-use as of now
      rate: req.body.rate ?? 1, // no-use as of now
      pitch: req.body.pitch ?? 1, // no-use as of now,

      // New Hold Line Feature
      hold_line: req?.body?.hold_line ?? false
    });

    res.status(200).send({ message: "OK" });
  } catch (err) {
    console.log("Error in sending response to user : ", err);
    res.status(500).send({ message: err.message });
  }
});

// app.use("/audio", audioRouter); // not in use as of now

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
