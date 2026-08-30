const User = require("../models/user");
const { ok, fail } = require("../libs/response");

// route - POST /user/details  (authenticated user)
const userDetails = async (req, res) => {
    const user = await User.findOne({ user_token: req.user.id });
    if (!user) return fail(res, "User not found", 404);
    return ok(res, user);
};

module.exports = {
    userDetails,
};
