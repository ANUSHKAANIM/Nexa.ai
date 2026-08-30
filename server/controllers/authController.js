const crypto = require("crypto");
const OtpAuth = require("../models/otpAuth");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const otpGenerator = require("otp-generator");
const { sendOtpEmail } = require("./emailController");
const { issueSession } = require("../libs/session");
const { ok, fail } = require("../libs/response");

const generateAndSendOtp = async (email) => {
    await OtpAuth.deleteMany({ email, purpose: "user-auth" });

    const OTP = otpGenerator.generate(6, {
        digits: true,
        upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false,
    });

    sendOtpEmail(email, OTP);

    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(OTP, salt);
    await OtpAuth.create({ email, otp: hashedOtp, purpose: "user-auth" });
};

// route - /user/signin
const signIn = async (req, res) => {
    const email = req.body.email;

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
        return fail(
            res,
            "This Email ID is not registered. Try Signing Up instead!",
            400
        );
    }

    await generateAndSendOtp(email);
    return ok(res, null, "Otp sent successfully!");
};

// route - /user/signup
const signUp = async (req, res) => {
    const email = req.body.email;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return fail(
            res,
            "This Email ID is already registered. Try Signing In instead!",
            400
        );
    }

    await generateAndSendOtp(email);
    return ok(res, null, "Otp sent successfully!");
};

// route - /user/signin/verify
const verifyLogin = async (req, res) => {
    const { email, otp: inputOtp } = req.body;

    const otpDoc = await OtpAuth.findOne({ email, purpose: "user-auth" });
    if (!otpDoc) {
        return fail(res, "The OTP expired. Please try again!", 400);
    }

    const validOtp = await bcrypt.compare(inputOtp, otpDoc.otp);
    if (!validOtp) {
        return fail(res, "OTP does not match. Please try again!", 406);
    }

    const user = await User.findOne({ email });
    if (!user) {
        return fail(res, "Account not found. Please sign up.", 400);
    }

    await OtpAuth.deleteMany({ email, purpose: "user-auth" });
    issueSession(res, { id: user.user_token, role: "user" });
    return ok(res, { user_id: user.user_token }, "Sign-In successful!");
};

// route - /user/signup/verify
const verifyOtp = async (req, res) => {
    const { contactNumber, otp: inputOtp, email, username, regNumber } =
        req.body;

    const otpDoc = await OtpAuth.findOne({ email, purpose: "user-auth" });
    if (!otpDoc) {
        return fail(res, "The OTP expired. Please try again!", 400);
    }

    const validOtp = await bcrypt.compare(inputOtp, otpDoc.otp);
    if (!validOtp) {
        return fail(res, "OTP does not match. Please try again!", 400);
    }

    const userToken = crypto.randomUUID();
    const newUser = await User.create({
        user_token: userToken,
        reg_number: regNumber,
        username,
        email,
        contactNumber,
    });

    await OtpAuth.deleteMany({ email, purpose: "user-auth" });
    issueSession(res, { id: newUser.user_token, role: "user" });
    return ok(
        res,
        { user_id: newUser.user_token },
        "Account creation successful!"
    );
};

module.exports = {
    signUp,
    verifyOtp,
    signIn,
    verifyLogin,
};
