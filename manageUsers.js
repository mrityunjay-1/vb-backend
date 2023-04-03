let users = [];

const addUser = (userData) => {
    try {

        const user = getUser(userData.socketId);

        if (user) throw new Error("User is already in added...");

        if (!userData || !userData.socketId || !userData.roomName || !userData.web_call_id || !userData.socket) throw new Error("proper user details not provided...");

        users = [...users, userData];

        return userData;

    } catch (err) {
        console.log("Error while adding user...", err);
    }
}

const getUser = (socketId, web_call_id) => {
    try {
        console.log("all users : ", users);
        const user = users.find((user) => (user.socketId === socketId || user.web_call_id === web_call_id));
        return user;
    } catch (err) {
        console.log("Error while finding user...", err);
    }
}

const removeUser = (socketId, roomName) => {
    try {

        const userIndex = users.findIndex((user) => (user.socketId === socketId));

        const removedUser = users.splice(userIndex, 1);

        console.log("removedUser: ", removedUser);

        return removedUser;

    } catch (err) {
        console.log("Error while removing user...", err);
    }
}

module.exports = {
    users,
    addUser,
    getUser,
    removeUser
}