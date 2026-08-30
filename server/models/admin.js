const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
    {
        admin_id: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        pass: {
            type: String,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        role: {
            type: String,
            enum: ["admin", "superadmin"],
            default: "admin",
            index: true,
        },
        status: {
            type: String,
            enum: ["invited", "active"],
            default: "invited",
        },
        active: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
