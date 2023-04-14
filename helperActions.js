
const getSessionDetails = (param) => {

    let transcription_data = require("../../projects/outputs/" + param + ".json");

    let chat_session_data = [];

    for (const [key, _value] of Object.entries(transcription_data)) {
        let obj = {
            user: {
                time: key,
                text: transcription_data[key]["User"],
                audio: `${process.env.SERVER_URL}/` + param + "/" + "user_" + key + ".wav",
            },
            bot: {
                time: key,
                text: transcription_data[key]["Bot"],
                audio: `${process.env.SERVER_URL}/` + param + "/" + "bot_" + key + ".mp3",
            },
        };

        chat_session_data.push(obj);
    }

    return chat_session_data;
}

module.exports = {
    getSessionDetails
}