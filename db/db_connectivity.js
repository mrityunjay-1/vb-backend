const mongoose = require("mongoose");

const db_url = `mongodb://${process.env.DB_URL}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
console.log("DB URL : ", db_url);

(
    async () => {
        try {

            await mongoose.connect(db_url);

            console.log("mongodb connection established...");

        } catch (err) {
            console.error("error : ", err);
        }
    }
)();