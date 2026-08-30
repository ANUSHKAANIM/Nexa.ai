const express = require("express");
const router = express.Router();
const {
    signUp,
    verifyOtp,
    signIn,
    verifyLogin,
} = require("../controllers/authController");
const validate = require("../middlewares/validate");
const { authLimiter } = require("../middlewares/rateLimit");
const asyncHandler = require("../middlewares/asyncHandler");
const {
    emailSchema,
    verifyLoginSchema,
    verifySignupSchema,
} = require("../schemas/authSchemas");

router
    .route("/signup")
    .post(authLimiter, validate(emailSchema), asyncHandler(signUp));
router
    .route("/signup/verify")
    .post(authLimiter, validate(verifySignupSchema), asyncHandler(verifyOtp));
router
    .route("/signin")
    .post(authLimiter, validate(emailSchema), asyncHandler(signIn));
router
    .route("/signin/verify")
    .post(authLimiter, validate(verifyLoginSchema), asyncHandler(verifyLogin));

module.exports = router;
