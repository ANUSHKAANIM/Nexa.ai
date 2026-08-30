const jwt = require("jsonwebtoken");

const COOKIE_NAME = "token";
const SESSION_TTL = "7d";

const issueSession = (res, { id, role }) => {
    const token = jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: SESSION_TTL,
    });
    res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
};

const clearSession = (res) => {
    res.clearCookie(COOKIE_NAME, { path: "/" });
};

module.exports = { issueSession, clearSession, COOKIE_NAME };
