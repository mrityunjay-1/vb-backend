const express = require("express");
const wav = require("node-wav");
const fs = require("fs");

const Router = express.Router();

Router.post("/record", (req, res) => {
    try {

        console.log("audio/record route called : ", JSON.parse(req.body.arr));

        // console.log(req.body.stream.toString());

        const wavBuff = wav.encode(JSON.parse(req.body.arr), { sampleRate: 20, float: true, bitDepth: 32 });

        fs.writeFileSync(new Date().getTime() + ".wav", wavBuff);

        res.status(200).send(req.body);

    } catch (err) {
        console.log("err: ", err);
    }
});

module.exports = Router;