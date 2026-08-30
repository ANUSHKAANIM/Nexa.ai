const express = require("express");
const router = express.Router();
const { userDetails } = require("../controllers/userDashboard");
const { verifyToken, requireRole } = require("../middlewares/auth");
const asyncHandler = require("../middlewares/asyncHandler");

router
    .route("/details")
    .get(verifyToken, requireRole("user"), asyncHandler(userDetails));

module.exports = router;
