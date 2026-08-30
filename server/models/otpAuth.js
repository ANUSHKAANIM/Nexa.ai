const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
        },
        otp: {
            type: String,
            required: true,
        },
        // Keeps a user-auth OTP and an admin-password-reset OTP for the same
        // email from ever being usable in the wrong flow.
        purpose: {
            type: String,
            enum: ["user-auth", "admin-reset"],
            default: "user-auth",
        },
        expireAt: {
            type: Date,
            default: Date.now,
            index: { expires: "300s" },
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("OtpAuth", otpSchema);
