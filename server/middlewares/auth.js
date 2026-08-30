const jwt = require("jsonwebtoken");
const { fail } = require("../libs/response");
const Admin = require("../models/admin");
const User = require("../models/user");
const asyncHandler = require("./asyncHandler");

const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.token;
    if (!token) return fail(res, "Not authenticated", 401);

    let payload;
    try {
        payload = jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return fail(res, "Session expired or invalid", 401);
    }
    if (!payload.id || !payload.role) {
        return fail(res, "Invalid session", 401);
    }

    // A validly-signed cookie can still refer to an account that's gone —
    // deactivated (admins), or deleted/from a stale database (either role).
    // Without this check here, a stale token can pass this middleware but
    // fail any route that actually looks the account up (e.g. /user/details),
    // producing a redirect loop between "you're signed in" and "no you're
    // not" instead of a single, final "you're signed out".
    if (payload.role === "admin" || payload.role === "superadmin") {
        const admin = await Admin.findOne({ admin_id: payload.id }).select("active");
        if (!admin || !admin.active) {
            return fail(res, "This admin account has been deactivated", 403);
        }
    } else if (payload.role === "user") {
        const user = await User.findOne({ user_token: payload.id }).select("_id");
        if (!user) {
            return fail(res, "Session expired or invalid", 401);
        }
    }

    req.user = { id: payload.id, role: payload.role };
    next();
});

const requireRole =
    (...roles) =>
    (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return fail(res, "You don't have permission to do that", 403);
        }
        next();
    };

module.exports = { verifyToken, requireRole };
