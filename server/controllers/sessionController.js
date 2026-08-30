const { clearSession } = require("../libs/session");
const { ok } = require("../libs/response");

// route - GET /me  (authenticated)
const me = async (req, res) => {
    return ok(res, { id: req.user.id, role: req.user.role });
};

// route - POST /logout
const logout = async (req, res) => {
    clearSession(res);
    return ok(res, null, "Logged out");
};

module.exports = { me, logout };
