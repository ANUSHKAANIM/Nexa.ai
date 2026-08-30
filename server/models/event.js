const mongoose = require("mongoose");

const CATEGORIES = ["Technical", "Cultural", "Workshop", "Sports", "Other"];

const eventSchema = new mongoose.Schema(
    {
        event_id: {
            type: String,
            required: true,
            unique: true,
        },
        name: {
            type: String,
        },
        venue: {
            type: String,
        },
        date: {
            type: String,
        },
        time: {
            type: String,
        },
        description: {
            type: String,
        },
        price: {
            type: Number,
        },
        cover: {
            type: String,
            default:
                "https://eventplanning24x7.files.wordpress.com/2018/04/events.png",
        },
        profile: {
            type: String,
            default:
                "https://i.etsystatic.com/15907303/r/il/c8acad/1940223106/il_794xN.1940223106_9tfg.jpg",
        },
        organizer: {
            type: String,
        },
        category: {
            type: String,
            enum: CATEGORIES,
        },
        capacity: {
            type: Number,
            default: null,
        },
        admin_id: {
            type: String,
            required: true,
            index: true,
        },
        participants: [],
        waitlist: [
            {
                id: String,
                name: String,
                email: String,
                joinedAt: { type: Date, default: Date.now },
            },
        ],
    },
    { timestamps: true }
);

// Supports the /getallevents filter/pagination query (category exact-match,
// price range) — event_id and admin_id already indexed above.
eventSchema.index({ category: 1 });
eventSchema.index({ price: 1 });
eventSchema.index({ createdAt: -1 });

const Event = mongoose.model("Event", eventSchema);

module.exports = {
    Event,
    eventSchema,
    CATEGORIES,
};
