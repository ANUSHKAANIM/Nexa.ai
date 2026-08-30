const nodemailer = require("nodemailer");

// Provider-agnostic: defaults to Gmail's SMTP (the most common free option),
// but any provider works by setting SMTP_HOST/SMTP_PORT/SMTP_SECURE — e.g.
// smtp.zoho.in:465 for Zoho, or your own SMTP relay.
function createTransporter() {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT) || 465,
        secure: process.env.SMTP_SECURE !== "false",
        auth: {
            user: process.env.NODE_MAILER_USER,
            pass: process.env.NODE_MAILER_PASS,
        },
        tls: {
            rejectUnauthorized: false, // Accept self-signed certificates
        },
    });
}

// Returns a promise the caller must await — Vercel serverless functions can
// freeze the execution context the instant a response is sent, which was
// silently killing these sends mid-flight when they were fire-and-forget
// (worked fine on a normal always-on Node process, where the event loop
// keeps running after res.send()).
async function send(mailOptions) {
    // Local dev convenience: print the email instead of sending it, so OTP/
    // invite flows are testable without real SMTP credentials. Never on by
    // default — must be explicitly opted into.
    if (process.env.DEV_LOG_EMAILS === "true") {
        console.log(`[DEV EMAIL] to=${mailOptions.to} subject="${mailOptions.subject}"\n${mailOptions.html}`);
        return;
    }

    // The From *address* has to be one the SMTP account is actually allowed
    // to send as (your login address, or a verified alias) — Gmail silently
    // rewrites anything else. MAIL_FROM_ADDRESS lets you point at a verified
    // "Send mail as" alias (e.g. you+nexa@gmail.com) once you've set one up;
    // MAIL_FROM_NAME just controls the display name shown to recipients.
    const fromName = process.env.MAIL_FROM_NAME || "NEXA";
    const fromAddress = process.env.MAIL_FROM_ADDRESS || process.env.NODE_MAILER_USER;

    const transporter = createTransporter();
    try {
        await transporter.sendMail({
            from: `"${fromName}" <${fromAddress}>`,
            ...mailOptions,
        });
        console.log(`Email sent: ${mailOptions.subject}`);
    } catch (err) {
        console.log(err);
    }
}

function sendOtpEmail(email, otp) {
    return send({
        to: email,
        subject: "One Time Password - NEXA",
        html: `Please keep your OTP confidential and do not share it with anyone. The OTP will be valid for five minutes only. <br><strong>OTP: ${otp}</strong><br><br>Thank you for choosing NEXA!<br><br>If you have any questions, please contact us at:<br>Anushka Nim : nimanushka@gmail.com<br>Best regards,<br>The NEXA Team`,
    });
}

function sendTicket(details) {
    return send({
        to: details.email,
        subject: `Your Online Event Pass for ${details.event_name} - NEXA`,
        html: `Dear <i>${details.name}</i>,<br><br>Thank you for registering for ${details.event_name}! We are excited to have you join us and want to make sure that you have all the information you need to have a great time.<br><br>Your online pass has been generated and is ready for you to use. Please remember to keep this pass with you at all times during the event and do not share it with anyone else.<br><br><strong>Pass Number: ${details.pass}</strong><br><br>Here are the details of your registration:<br>Name: ${details.name}<br>Amount Paid: ${details.price}<br>Address: ${details.address1} <br> City: ${details.city} <br> PinCode: ${details.zip}<br><br>If you have any questions or concerns, please don't hesitate to reach out to us. We're here to help please contact us at:<br>Anushka Nim : nimanushka@gmail.com<br>Best regards,<br>The NEXA Team`,
    });
}

function sendCheckInMail(data) {
    return send({
        to: data.email,
        subject: `${data.name} You've Checked In - NEXA`,
        html: `Dear ${data.name},<br><br>
           <strong>Congratulations, you've successfully checked in!</strong><br><br>
           Name: ${data.name}<br>
           Registration Number: ${data.regNo}<br>
           Contact Number: ${data.number}<br><br>
           If you have any questions or concerns, please don't hesitate to contact us:<br>
           Anushka Nim: nimanushka@gmail.com<br>
           Thank you for choosing NEXA<br><br>
           Best regards,<br>
           The NEXA Team`,
    });
}

function sendAdminInviteEmail(email, name, inviteUrl) {
    return send({
        to: email,
        subject: "You've been invited to NEXA as an admin",
        html: `Hi ${name},<br><br>You've been invited to join NEXA as an event admin. Click the link below to set your password and activate your account. This link expires in 48 hours.<br><br><a href="${inviteUrl}">${inviteUrl}</a><br><br>If you weren't expecting this invite, you can ignore this email.<br><br>Best regards,<br>The NEXA Team`,
    });
}

function sendAdminPasswordResetEmail(email, otp) {
    return send({
        to: email,
        subject: "Reset your NEXA admin password",
        html: `Someone requested a password reset for this NEXA admin account. Use the code below to set a new password — it's valid for five minutes.<br><br><strong>Code: ${otp}</strong><br><br>If you didn't request this, you can safely ignore this email; your password won't change.<br><br>Best regards,<br>The NEXA Team`,
    });
}

module.exports = {
    sendOtpEmail,
    sendTicket,
    sendCheckInMail,
    sendAdminInviteEmail,
    sendAdminPasswordResetEmail,
};
