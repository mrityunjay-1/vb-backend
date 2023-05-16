
const getSessionDetails = (param) => {
    try {

        console.log("getsession details : ", param);

        const path = "../../projects/outputs/" + param + ".json";

        delete require.cache[require.resolve(path)];

        console.log("path: ", path);

        let transcription_data = require(path);

        console.log("transcription_data: ", transcription_data);

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
    } catch (err) {
        console.log("Error: ", err);
        return [];
    }
}

module.exports = {
    getSessionDetails
}