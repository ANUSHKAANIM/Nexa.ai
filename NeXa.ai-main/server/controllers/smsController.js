
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

function sendSMS(Email, otp) {
    let transporter = nodemailer.createTransport({
        host: "smtp.zoho.in", // Zoho SMTP server
        port: 465, // Port for secure SMTP
        secure: true, // Use SSL
        auth: {
            user: process.env.NODE_MAILER_USER, // Your Zoho email address
            pass: process.env.NODE_MAILER_PASS, // Your Zoho email password
        },
        tls: {
            rejectUnauthorized: false, // Accept self-signed certificates
        },
    });

    let mailOptions = {
        from: process.env.NODE_MAILER_USER,
        to: Email,
        subject: "One Time Password - NEXA",
        html: `Please keep your OTP confidential and do not share it with anyone. The OTP will be valid for five minutes only. <br><strong>OTP: ${otp}</strong><br><br>Thank you for choosing NEXA!<br><br>If you have any questions, please contact us at:<br>Anushka Nim : nimanushka@gmail.com<br>Best regards,<br>The NEXA Team`,
    };

    transporter.sendMail(mailOptions, function (err, success) {
        if (err) {
            console.log(err);
        } else {
            console.log("Email sent successfully");
        }
    });
}

function sendTicket(Details) {
    let transporter = nodemailer.createTransport({
        host: "smtp.zoho.in", // Zoho SMTP server
        port: 465, // Port for secure SMTP
        secure: true, // Use SSL
        auth: {
            user: process.env.NODE_MAILER_USER, // Your Zoho email address
            pass: process.env.NODE_MAILER_PASS, // Your Zoho email password
        },
        tls: {
            rejectUnauthorized: false, // Accept self-signed certificates
        },
    });

    let mailOptions = {
        from: process.env.NODE_MAILER_USER,
        to: Details.email,
        subject: `Your Online Event Pass for ${Details.event_name} - NEXA`,
        html: `Dear <i>${Details.name}</i>,<br><br>Thank you for registering for ${Details.event_name}! We are excited to have you join us and want to make sure that you have all the information you need to have a great time.<br><br>Your online pass has been generated and is ready for you to use. Please remember to keep this pass with you at all times during the event and do not share it with anyone else.<br><br><strong>Pass Number: ${Details.pass}</strong><br><br>Here are the details of your registration:<br>Name: ${Details.name}<br>Amount Paid: ${Details.price}<br>Address: ${Details.address1} <br> City: ${Details.city} <br> PinCode: ${Details.zip}<br><br>If you have any questions or concerns, please don't hesitate to reach out to us. We're here to help please contact us at:<br>Anushka Nim : nimanushka@gmail.com<br>Best regards,<br>The NEXA Team`,
    };

    transporter.sendMail(mailOptions, function (err, success) {
        if (err) {
            console.log(err);
        } else {
            console.log("Email sent successfully");
        }
    });
}

module.exports = {
    sendSMS,
    sendTicket,
};
