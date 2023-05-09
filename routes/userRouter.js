const express = require("express");

const { User } = require("../models/users");
const { decodeToken } = require("../middlewares/helperActions");

const Router = express.Router();

const { v4 } = require("uuid");
const { hashPassword } = require("../utils/utility");

Router.post("/verifyToken", async (req, res) => {
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

Router.post("/userSignUp", async (req, res) => {
    try {

        const body = req.body;

        const user = {
            tenantId: v4()
        };

        if (!body || !body.email || !body.name) throw new Error("Required params not received in the body...");

        user.name = body.name;
        user.email = body.email;

        if (body.password) {
            user.password = hashPassword(body.password);
        } else {
            const randomString = require("crypto").randomBytes(10).toString("hex");
            user.password = hashPassword(randomString);
        }

        const createdUser = new User(user);
        await createdUser.save();

        res.status(200).send({ message: "user created successfully..." });

    } catch (err) {
        console.log("Error: ", err);
        res.status(500).send({ message: "User Sign Up Failed. May be email id already exist for this app.", status: "Failed" });
    }
});

Router.post("/userLogin", async (req, res) => {
    try {

        const { email, password } = req.body;

        if (!email || !password) throw new Error("Either user id or password not received in the body...");

        const user = await User.findUserByEmailAndPassword({ email, password });

        if (!user) throw new Error("No user found with the email: ", email);

        const token = await user.generateToken({ userId: user._id });

        res.status(200).send({ name: user.name, email: user.email, token, tenantId: user.tenantId });

    } catch (err) {
        console.error("Error while user login : ", err);
        res.status(500).send({ message: "Login Failed", status: "Failed" });
    }
});

module.exports = Router;