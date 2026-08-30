const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const otpGenerator = require("otp-generator");
const Admin = require("../models/admin");
const { Event } = require("../models/event");
const OtpAuth = require("../models/otpAuth");
const { issueSession } = require("../libs/session");
const { ok, fail } = require("../libs/response");
const { sendAdminInviteEmail, sendAdminPasswordResetEmail } = require("./emailController");

const INVITE_TTL = "48h";

// route - /admin/auth
const adminAuth = async (req, res) => {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
        return fail(res, "Admin access denied", 400);
    }
    if (!admin.active) {
        return fail(res, "This admin account has been deactivated", 403);
    }
    if (admin.status !== "active") {
        return fail(res, "Accept your invite email before signing in", 400);
    }

    const validPass = await bcrypt.compare(password, admin.pass);
    if (!validPass) {
        return fail(res, "Email or Password is wrong", 400);
    }

    issueSession(res, { id: admin.admin_id, role: admin.role });
    return ok(res, { admin_token: admin.admin_id, role: admin.role }, "Success");
};

// route - /admin/details  (authenticated admin/superadmin; id from req.user)
const adminDetails = async (req, res) => {
    const admin = await Admin.findOne({ admin_id: req.user.id }).select(
        "-pass"
    );
    if (!admin) {
        return fail(res, "No such admin exists", 400);
    }
    return ok(res, admin);
};

// route - /admin/list  (superadmin only)
const listAdmins = async (req, res) => {
    const admins = await Admin.find({}).select("-pass");
    const withCounts = await Promise.all(
        admins.map(async (a) => ({
            admin_id: a.admin_id,
            name: a.name,
            email: a.email,
            role: a.role,
            status: a.status,
            active: a.active,
            eventCount: await Event.countDocuments({ admin_id: a.admin_id }),
            createdAt: a.createdAt,
        }))
    );
    return ok(res, withCounts);
};

// route - /admin/invite  (superadmin only)
const inviteAdmin = async (req, res) => {
    const { name, email } = req.body;

    const existing = await Admin.findOne({ email });
    if (existing) {
        return fail(res, "An admin with this email already exists", 400);
    }

    const adminId = crypto.randomUUID();
    await Admin.create({
        admin_id: adminId,
        email,
        name,
        role: "admin",
        status: "invited",
        active: true,
    });

    const inviteToken = jwt.sign(
        { adminId, purpose: "admin-invite" },
        process.env.JWT_SECRET,
        { expiresIn: INVITE_TTL }
    );
    const inviteUrl = `${process.env.DEPLOYED_URL}/admin/accept-invite?token=${inviteToken}`;
    sendAdminInviteEmail(email, name, inviteUrl);

    return ok(res, null, "Invite sent");
};

// route - /admin/accept-invite
const acceptInvite = async (req, res) => {
    const { token, password } = req.body;

    let payload;
    try {
        payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return fail(res, "This invite link is invalid or has expired", 400);
    }
    if (payload.purpose !== "admin-invite") {
        return fail(res, "This invite link is invalid", 400);
    }

    const admin = await Admin.findOne({ admin_id: payload.adminId });
    if (!admin) {
        return fail(res, "This invite is no longer valid", 400);
    }
    if (admin.status === "active") {
        return fail(res, "This invite has already been accepted", 400);
    }

    const salt = await bcrypt.genSalt(10);
    admin.pass = await bcrypt.hash(password, salt);
    admin.status = "active";
    await admin.save();

    issueSession(res, { id: admin.admin_id, role: admin.role });
    return ok(res, { admin_token: admin.admin_id }, "Account activated");
};

// route - POST /admin/forgot-password  (public)
// Always responds the same way regardless of whether the email belongs to a
// real admin account — otherwise this endpoint becomes a way to check which
// emails are registered as admins.
const requestPasswordReset = async (req, res) => {
    const { email } = req.body;
    const genericMessage = "If that email is registered, a reset code has been sent.";

    const admin = await Admin.findOne({ email, status: "active", active: true });
    if (!admin) {
        return ok(res, null, genericMessage);
    }

    await OtpAuth.deleteMany({ email, purpose: "admin-reset" });

    const OTP = otpGenerator.generate(6, {
        digits: true,
        upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false,
    });
    sendAdminPasswordResetEmail(email, OTP);

    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(OTP, salt);
    await OtpAuth.create({ email, otp: hashedOtp, purpose: "admin-reset" });

    return ok(res, null, genericMessage);
};

// route - POST /admin/reset-password  (public)
const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    const otpDoc = await OtpAuth.findOne({ email, purpose: "admin-reset" });
    if (!otpDoc) {
        return fail(res, "The code has expired. Please request a new one.", 400);
    }

    const validOtp = await bcrypt.compare(otp, otpDoc.otp);
    if (!validOtp) {
        return fail(res, "That code doesn't match. Please try again.", 400);
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
        return fail(res, "No such admin exists", 400);
    }

    const salt = await bcrypt.genSalt(10);
    admin.pass = await bcrypt.hash(newPassword, salt);
    await admin.save();

    await OtpAuth.deleteMany({ email, purpose: "admin-reset" });

    return ok(res, null, "Password reset — you can now sign in with your new password.");
};

// route - POST /admin/change-password  (authenticated admin/superadmin)
const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const admin = await Admin.findOne({ admin_id: req.user.id });
    if (!admin) return fail(res, "No such admin exists", 404);

    const validPass = await bcrypt.compare(currentPassword, admin.pass);
    if (!validPass) {
        return fail(res, "Current password is incorrect", 400);
    }

    const salt = await bcrypt.genSalt(10);
    admin.pass = await bcrypt.hash(newPassword, salt);
    await admin.save();

    return ok(res, null, "Password updated");
};

// route - PATCH /admin/:id/status  (superadmin only)
const updateAdminStatus = async (req, res) => {
    const targetId = req.params.id;
    if (targetId === req.user.id) {
        return fail(res, "You can't deactivate your own account", 400);
    }

    const admin = await Admin.findOne({ admin_id: targetId });
    if (!admin) {
        return fail(res, "No such admin exists", 404);
    }

    admin.active = !admin.active;
    await admin.save();
    return ok(res, { active: admin.active }, "Updated");
};

module.exports = {
    adminAuth,
    adminDetails,
    listAdmins,
    inviteAdmin,
    acceptInvite,
    requestPasswordReset,
    resetPassword,
    changePassword,
    updateAdminStatus,
};
