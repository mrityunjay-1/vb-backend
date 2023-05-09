const { v4 } = require("uuid");
const bcryptjs = require("bcryptjs");

const hashPassword = (password) => {
    try {

        const hashedPassword = bcryptjs.hashSync(password, 8);

        if (!hashedPassword) throw new Error("Something went wrong while generating hased password...");

        return hashedPassword;

    } catch (err) {
        console.log("Error while hashing the password: ", err);
    }
}

module.exports = {
    v4,
    hashPassword
}