const crypto = require("crypto");
const { Event } = require("../models/event");
const User = require("../models/user");
const { sendCheckInMail } = require("./emailController");
const { ok, fail } = require("../libs/response");
const { promoteFromWaitlist } = require("./paymentController");

const canManageEvent = (event, user) =>
    user.role === "superadmin" || event.admin_id === user.id;

// Shared by /getallevents and /event/mine — filters in MongoDB (indexed)
// instead of the client fetching every event and filtering in a useEffect,
// which stops scaling once there are more than a couple hundred events.
//
// `date` is stored as a "DD/MM/YYYY" string (not a real Date), so a plain
// $gte on it would sort lexicographically, not chronologically — this
// rebuilds a "YYYY-MM-DD" string via $expr to compare correctly without
// needing a schema migration.
function buildEventFilter({ q, category, dateFrom, priceMin, priceMax }) {
    const filter = {};
    const exprClauses = [];

    if (q) filter.name = { $regex: q, $options: "i" };
    if (category) filter.category = category;
    if (priceMin != null || priceMax != null) {
        filter.price = {};
        if (priceMin != null) filter.price.$gte = priceMin;
        if (priceMax != null) filter.price.$lte = priceMax;
    }
    if (dateFrom) {
        exprClauses.push({
            $gte: [
                {
                    $concat: [
                        { $substrCP: ["$date", 6, 4] },
                        "-",
                        { $substrCP: ["$date", 3, 2] },
                        "-",
                        { $substrCP: ["$date", 0, 2] },
                    ],
                },
                dateFrom,
            ],
        });
    }
    if (exprClauses.length) {
        filter.$expr = exprClauses.length === 1 ? exprClauses[0] : { $and: exprClauses };
    }

    return filter;
}

async function paginate(baseFilter, { page, limit }) {
    const skip = (page - 1) * limit;
    const [events, total] = await Promise.all([
        Event.find(baseFilter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Event.countDocuments(baseFilter),
    ]);
    return { events, total, page, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

// route - POST /post/event  (admin/superadmin)
const postEvent = async (req, res) => {
    const {
        name,
        venue,
        date,
        time,
        description,
        price,
        profile,
        cover,
        organizer,
        category,
        capacity,
    } = req.body;

    const eventId = crypto.randomUUID();

    const eventData = {
        event_id: eventId,
        admin_id: req.user.id,
        name,
        venue,
        date,
        time,
        description,
        price,
        organizer,
        category,
        capacity: capacity ?? null,
    };
    if (profile) eventData.profile = profile;
    if (cover) eventData.cover = cover;

    const newEvent = await Event.create(eventData);

    return ok(res, { event_id: newEvent.event_id }, "Event created", 201);
};

// route - GET /event/mine  (admin/superadmin) — the admin dashboard's event
// list; queried live from Event so it can never drift from an edited/deleted
// event the way a denormalized copy on the Admin doc would.
const myEvents = async (req, res) => {
    const ownerFilter = req.user.role === "superadmin" ? {} : { admin_id: req.user.id };
    const filter = { ...ownerFilter, ...buildEventFilter(req.query) };
    const result = await paginate(filter, req.query);
    return ok(res, result);
};

// route - PATCH /event/:event_id  (owning admin/superadmin)
const updateEvent = async (req, res) => {
    const event = await Event.findOne({ event_id: req.params.event_id });
    if (!event) return fail(res, "Event not found", 404);
    if (!canManageEvent(event, req.user)) {
        return fail(res, "You don't have permission to edit this event", 403);
    }

    const capacityRaised =
        req.body.capacity != null &&
        (event.capacity == null || req.body.capacity > event.capacity);

    Object.assign(event, req.body);
    await event.save();

    if (capacityRaised) await promoteFromWaitlist(event.event_id);

    return ok(res, event, "Event updated");
};

// route - GET /getallevents
const allEvents = async (req, res) => {
    const filter = buildEventFilter(req.query);
    const result = await paginate(filter, req.query);
    return ok(res, result);
};

// route - POST /getevent
const particularEvent = async (req, res) => {
    const event = await Event.findOne({ event_id: req.body.event_id });
    if (!event) return fail(res, "Event not found", 404);
    return ok(res, event);
};

// route - POST /deleteevent  (owning admin/superadmin)
const deleteEvent = async (req, res) => {
    const event = await Event.findOne({ event_id: req.body.event_id });
    if (!event) return fail(res, "Event not found", 404);
    if (!canManageEvent(event, req.user)) {
        return fail(
            res,
            "You don't have permission to delete this event",
            403
        );
    }

    await Event.deleteOne({ event_id: event.event_id });

    return ok(res, null, "success");
};

// route - POST /event/checkin  (owning admin/superadmin)
const checkin = async (req, res) => {
    const { event_id: eventId, checkInList: userList } = req.body;

    const event = await Event.findOne({ event_id: eventId });
    if (!event) return fail(res, "Event not found", 404);
    if (!canManageEvent(event, req.user)) {
        return fail(res, "You don't have permission for this event", 403);
    }

    await Event.updateOne(
        { event_id: eventId, "participants.id": { $in: userList } },
        { $set: { "participants.$[p].entry": true } },
        { arrayFilters: [{ "p.id": { $in: userList } }] }
    );

    const users = await User.find({ user_token: { $in: userList } });
    users.forEach((user) => {
        sendCheckInMail({
            name: user.username,
            regNo: user.reg_number,
            email: user.email,
            number: user.contactNumber,
            event: event.name,
        });
    });

    return ok(res, null, "success");
};

module.exports = {
    postEvent,
    updateEvent,
    myEvents,
    allEvents,
    particularEvent,
    deleteEvent,
    checkin,
};
