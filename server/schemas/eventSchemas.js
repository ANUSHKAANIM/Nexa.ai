const { z } = require("zod");

const CATEGORIES = ["Technical", "Cultural", "Workshop", "Sports", "Other"];

const createEventSchema = z.object({
    name: z.string().trim().min(1, "Name is required"),
    venue: z.string().trim().min(1, "Venue is required"),
    date: z.string().trim().min(1, "Date is required"),
    time: z.string().trim().min(1, "Time is required"),
    description: z.string().trim().min(1, "Description is required"),
    price: z.coerce.number().min(0, "Price can't be negative"),
    organizer: z.string().trim().min(1, "Organizer is required"),
    profile: z.string().trim().optional(),
    cover: z.string().trim().optional(),
    category: z.enum(CATEGORIES).optional(),
    capacity: z.coerce.number().int().positive().optional().nullable(),
});

const updateEventSchema = createEventSchema.partial();

const eventIdSchema = z.object({
    event_id: z.string().trim().min(1, "event_id is required"),
});

const checkinSchema = z.object({
    event_id: z.string().trim().min(1, "event_id is required"),
    checkInList: z.array(z.string().trim().min(1)),
});

const scanCheckinSchema = z.object({
    token: z.string().min(1, "token is required"),
});

const listEventsQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(24),
    q: z.string().trim().optional(),
    category: z.enum(CATEGORIES).optional(),
    dateFrom: z.string().trim().optional(),
    priceMin: z.coerce.number().min(0).optional(),
    priceMax: z.coerce.number().min(0).optional(),
});

module.exports = {
    CATEGORIES,
    createEventSchema,
    updateEventSchema,
    eventIdSchema,
    checkinSchema,
    scanCheckinSchema,
    listEventsQuerySchema,
};
