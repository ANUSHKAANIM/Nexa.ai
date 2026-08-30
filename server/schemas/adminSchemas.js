const { z } = require("zod");

const adminAuthSchema = z.object({
    email: z.string().trim().email("Enter a valid email address"),
    password: z.string().min(1, "Password is required"),
});

const inviteAdminSchema = z.object({
    name: z.string().trim().min(1, "Name is required"),
    email: z.string().trim().email("Enter a valid email address"),
});

const acceptInviteSchema = z.object({
    token: z.string().min(1, "Invite token is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

const forgotPasswordSchema = z.object({
    email: z.string().trim().email("Enter a valid email address"),
});

const resetPasswordSchema = z.object({
    email: z.string().trim().email("Enter a valid email address"),
    otp: z.string().trim().length(6, "Code must be 6 digits"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

module.exports = {
    adminAuthSchema,
    inviteAdminSchema,
    acceptInviteSchema,
    changePasswordSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
};
