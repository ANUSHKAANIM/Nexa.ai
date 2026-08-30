// One-time setup script: creates the first superadmin account.
// Run manually once per environment: node scripts/bootstrapSuperadmin.js <name> <email> <password>
// Not exposed over HTTP anywhere — /setadmin (the old open endpoint) has been removed.
const crypto = require("crypto");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
dotenv.config();

const Admin = require("../models/admin");

async function main() {
    const [name, email, password] = process.argv.slice(2);
    if (!name || !email || !password) {
        console.error(
            "Usage: node scripts/bootstrapSuperadmin.js <name> <email> <password>"
        );
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_ATLAS_URI);

    const existing = await Admin.findOne({ email: email.toLowerCase() });
    if (existing) {
        console.error(`An admin with email ${email} already exists.`);
        process.exit(1);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);

    await Admin.create({
        admin_id: crypto.randomUUID(),
        email,
        name,
        pass: hashedPass,
        role: "superadmin",
        status: "active",
        active: true,
    });

    console.log(`Superadmin ${email} created.`);
    await mongoose.disconnect();
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
