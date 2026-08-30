const rateLimit = require("express-rate-limit");
const { fail } = require("../libs/response");

const handler = (req, res) =>
    fail(res, "Too many attempts. Please try again later.", 429);

// Real rate limiting only matters against real internet traffic. In local
// development the same person hammers these endpoints constantly while
// testing — without this, the fixed protection meant for one abusive
// stranger keeps locking out the one developer using the app.
const skip = () => process.env.NODE_ENV !== "production";

// Unauthenticated, brute-force/OTP-guessing-prone endpoints (sign in/up,
// OTP verify, admin login): 10 requests / 15 min per IP.
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    skip,
    handler,
});

// Already-authenticated actions gated behind requireRole (e.g. sending
// admin invites): a separate, more generous bucket, so a superadmin doing
// legitimate bulk work never gets starved by unrelated sign-in attempts
// sharing the same counter — and vice versa.
const actionLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
    skip,
    handler,
});

module.exports = { authLimiter, actionLimiter };
