const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");

const UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

UserSchema.statics.findUserByEmailAndPassword = async function ({ email, password }) {
    try {

        const user = await User.findOne({ email });

        if (!user) throw new Error("user not found with email: ", email);

        const isPasswordCorrect = bcryptjs.compareSync(password, user.password);

        if (!isPasswordCorrect) throw new Error("password is incorrect!");

        return user;

    } catch (err) {
        console.log("Error in findUserByEmail func...");
    }
}

UserSchema.methods.generateToken = async function (userId) {
    try {

        const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1d" });

        if (!token) throw new Error("Error while generating token...");

        return token;

    } catch (err) {
        console.log("Error: ", err);
    }
}

const User = new mongoose.model("User", UserSchema);

module.exports = {
    User
}