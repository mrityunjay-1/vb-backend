const express = require("express");

const { User } = require("../models/users");
const { decodeToken } = require("../middlewares/helperActions");

const Router = express.Router();

Router.get("/verifyToken", async (req, res) => {
    try {

        const token = req.body.token;

        const decodedTokenRes = await decodeToken(token);

        console.log("decodedTokenRes: ", decodedTokenRes);

        res.status(200).send({ isValid: true });

    } catch (err) {
        console.error("Error while user login : ", err);
        res.status(500).send({ isValid: false });
    }
});

Router.post("/userLogin", async (req, res) => {
    try {

        const { email, password } = req.body;

        if (!email || !password) throw new Error("Either user id or password not received in the body...");

        const user = await User.findUserByEmailAndPassword({ email, password });

        if (!user) throw new Error("No user found with the email: ", email);

        const token = await user.generateToken({ userId: user._id });

        res.status(200).send({ name: user.name, email: user.email, token });

    } catch (err) {
        console.error("Error while user login : ", err);
        res.status(500).send({ message: "Login Failed", status: "Failed" });
    }
});

module.exports = Router;