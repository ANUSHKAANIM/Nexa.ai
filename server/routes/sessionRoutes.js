const express = require("express");
const router = express.Router();
const { me, logout } = require("../controllers/sessionController");
const { verifyToken } = require("../middlewares/auth");
const asyncHandler = require("../middlewares/asyncHandler");

router.route("/me").get(verifyToken, asyncHandler(me));
router.route("/logout").post(asyncHandler(logout));

module.exports = router;
