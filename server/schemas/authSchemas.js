const { z } = require("zod");

const emailSchema = z.object({
    email: z.string().trim().email("Enter a valid email address"),
});

const verifyLoginSchema = z.object({
    email: z.string().trim().email("Enter a valid email address"),
    otp: z.string().trim().length(6, "OTP must be 6 digits"),
});

const verifySignupSchema = z.object({
    email: z.string().trim().email("Enter a valid email address"),
    otp: z.string().trim().length(6, "OTP must be 6 digits"),
    username: z.string().trim().min(1, "Name is required"),
    regNumber: z
        .string()
        .trim()
        .regex(/^[A-Za-z]{3}\d{7}$/, "Registration number format is invalid"),
    contactNumber: z.string().trim().min(7, "Enter a valid contact number"),
});

module.exports = { emailSchema, verifyLoginSchema, verifySignupSchema };
