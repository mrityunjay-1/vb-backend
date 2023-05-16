
const { LiveUser } = require("./models/live-users");
const { ChatLogs } = require("./models/chat-logs");
const { ChatSessions } = require("./models/chat-sessions");

const { getSessionDetails } = require("./helperActions");

// this thing is currently not in use -> using mongodb to maintain users...
let users = [];

const addUser = async (userData) => {
    try {

        const user = await getUser(userData.socketId);

        if (user) throw new Error("User is already in added...");

        if (!userData || !userData.socketId || !userData.roomName || !userData.web_call_id) throw new Error("proper user details not provided...");

        users = [...users, userData];

        const liveUser = new LiveUser(userData);
        await liveUser.save();

        return userData;

    } catch (err) {
        console.log("Error while adding user...", err);
    }
}

const getUser = async (socketId, web_call_id) => {
    try {

        console.log("all users : ", users);
        // const user = users.find((user) => (user.socketId === socketId || user.web_call_id === web_call_id));

        const user = await LiveUser.findOne({ socketId });

        return user;

    } catch (err) {
        console.log("Error while finding user...", err);
    }
}

const removeUser = async (socketId, _roomName) => {
    try {

        if (socketId) {

            // const userIndex = users.findIndex((user) => (user.socketId === socketId));
            // const removedUser = users.splice(userIndex, 1);
            // console.log("removedUser: ", removedUser);
            // return removedUser;

            const ru = await LiveUser.findOneAndRemove({ socketId }).lean().exec();

            const data = getSessionDetails(socketId);

            const cs = await ChatSessions.deleteMany({ socketId });
            const cl = await ChatLogs.deleteMany({ chat_session: socketId });

            const chatLog = new ChatLogs({ chat_session: socketId, logs: data });

            const chatSession = new ChatSessions({
                email: ru.email,
                name: ru.name,
                phone: ru.phone,
                roomName: ru.roomName,
                socketId: ru.socketId,
                startDateTime: ru.startDateTime,
                userType: ru.userType,
                web_call_id: ru.web_call_id,
                chat_logs: chatLog._id
            });

            await chatLog.save();
            await chatSession.save();

            console.log("ru: ", ru);

        }

    } catch (err) {
        console.log("Error while removing user...", err);
    }
}

const getAllUsers = async () => {
    try {

        const users = await LiveUser.find({ userType: "user" });
        return users;

    } catch (err) {
        console.log("Error: ", err);
    }
}

const getUserRoomBySocketId = async (socketId) => {
    try {

        if (!socketId) {
            console.log("No Socket id received to get roomname");
            return null;
        }

        const user = await LiveUser.findOne({ socketId });

        return user;

    } catch (err) {
        console.log("Error: ", err);
    }
}

module.exports = {
    users,
    addUser,
    getUser,
    removeUser,
    getAllUsers,
    getUserRoomBySocketId
}