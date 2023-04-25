const jwt = require("jsonwebtoken");

const decodeToken = (token) => {
    try {

        if (!token) throw new Error("No token received for decoding...");

        return new Promise((resolve, reject) => {
            jwt.verify(token, process.env.JWT_SECRET, function (err, data) {
                if (err) reject(err);
                else resolve(data);
            })
        })

    } catch (err) {
        console.error("Error while decoding the token: ", err);
    }
}

module.exports = {
    decodeToken
}