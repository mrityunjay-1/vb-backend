const { User } = require("../models/users");
const { decodeToken } = require("./helperActions");

const authMiddleware = async (req, res, next) => {
    try {

        const authorizationHeaderValue = req?.headers?.authorization;

        if (!authorizationHeaderValue) throw new Error("No authorization header or authorization header value found!");

        const token = authorizationHeaderValue.split("Bearer ")[1];

        if (!token) throw new Error("No Authorization Token received for Authentication.");

        const decodedTokenData = await decodeToken(token);

        if (!decodedTokenData?.userId?.userId) throw new Error("No data found after decoding json web token.");

        const user = await User.findOne({ _id: decodedTokenData.userId.userId });

        if (!user) throw new Error("No user found for given token!");

        req.user = user;
        req.token = token;

        next();

    } catch (err) {
        console.log("Error in auth middleware function... ", err);
        res.status(500).send({ message: err.message });
    }
}

module.exports = authMiddleware;