const mongoose = require("mongoose");

// A user's own record of an event they booked — an event snapshot plus
// their personal ticket info (pass/entry status). Deliberately separate
// from the full Event schema: a user's own registeredEvents entry should
// never carry the event's complete participants list (that would leak
// every other attendee's info into this user's document).
const ticketSchema = new mongoose.Schema(
    {
        event_id: String,
        name: String,
        venue: String,
        date: String,
        time: String,
        description: String,
        price: Number,
        cover: String,
        profile: String,
        organizer: String,
        category: String,
        passID: String,
        entry: { type: Boolean, default: false },
    },
    { _id: false }
);

const userSchema = new mongoose.Schema(
    {
        user_token: {
            type: String,
            required: true,
            unique: true,
        },
        reg_number: {
            type: String,
            trim: true,
            required: true,
        },
        username: {
            type: String,
            trim: true,
        },
        email: {
            type: String,
            trim: true,
            unique: true,
            lowercase: true,
        },
        contactNumber: {
            type: String,
            required: true,
        },
        registeredEvents: [ticketSchema],
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
