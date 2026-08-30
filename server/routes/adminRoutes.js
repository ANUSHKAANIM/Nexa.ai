const express = require("express");
const router = express.Router();
const {
    adminAuth,
    adminDetails,
    listAdmins,
    inviteAdmin,
    acceptInvite,
    requestPasswordReset,
    resetPassword,
    changePassword,
    updateAdminStatus,
} = require("../controllers/adminController");
const { verifyToken, requireRole } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { authLimiter, actionLimiter } = require("../middlewares/rateLimit");
const asyncHandler = require("../middlewares/asyncHandler");
const {
    adminAuthSchema,
    inviteAdminSchema,
    acceptInviteSchema,
    changePasswordSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
} = require("../schemas/adminSchemas");

router
    .route("/admin/auth")
    .post(authLimiter, validate(adminAuthSchema), asyncHandler(adminAuth));
router
    .route("/admin/accept-invite")
    .post(
        authLimiter,
        validate(acceptInviteSchema),
        asyncHandler(acceptInvite)
    );
router
    .route("/admin/forgot-password")
    .post(
        authLimiter,
        validate(forgotPasswordSchema),
        asyncHandler(requestPasswordReset)
    );
router
    .route("/admin/reset-password")
    .post(
        authLimiter,
        validate(resetPasswordSchema),
        asyncHandler(resetPassword)
    );

router
    .route("/admin/details")
    .get(
        verifyToken,
        requireRole("admin", "superadmin"),
        asyncHandler(adminDetails)
    );

router
    .route("/admin/list")
    .get(verifyToken, requireRole("superadmin"), asyncHandler(listAdmins));
router
    .route("/admin/invite")
    .post(
        verifyToken,
        requireRole("superadmin"),
        actionLimiter,
        validate(inviteAdminSchema),
        asyncHandler(inviteAdmin)
    );
router
    .route("/admin/change-password")
    .post(
        verifyToken,
        requireRole("admin", "superadmin"),
        actionLimiter,
        validate(changePasswordSchema),
        asyncHandler(changePassword)
    );
router
    .route("/admin/:id/status")
    .patch(
        verifyToken,
        requireRole("superadmin"),
        asyncHandler(updateAdminStatus)
    );

module.exports = router;
