const { Event } = require("../models/event");
const User = require("../models/user");
const { sendCheckInMail } = require("./emailController");
const { ok, fail } = require("../libs/response");
const { signCheckinToken, verifyCheckinToken, toQrDataUrl } = require("../libs/qr");

// route - GET /event/:event_id/ticket-qr  (authenticated user)
const getTicketQr = async (req, res) => {
    const event = await Event.findOne({ event_id: req.params.event_id });
    if (!event) return fail(res, "Event not found", 404);

    const isRegistered = event.participants.some((p) => p.id === req.user.id);
    if (!isRegistered) return fail(res, "You're not registered for this event", 403);

    const token = signCheckinToken(event.event_id, req.user.id);
    const qrDataUrl = await toQrDataUrl(token);
    return ok(res, { qrDataUrl });
};

// route - POST /event/checkin/scan  (owning admin/superadmin)
// Alternative to the search-based checklist in registration.jsx — an admin
// scans an attendee's QR (rendered from getTicketQr) instead of searching a
// list by name.
const scanCheckin = async (req, res) => {
    const { token } = req.body;

    let payload;
    try {
        payload = verifyCheckinToken(token);
    } catch (error) {
        return fail(res, "This QR code is invalid or expired", 400);
    }

    const event = await Event.findOne({ event_id: payload.event_id });
    if (!event) return fail(res, "Event not found", 404);

    const isOwner = req.user.role === "superadmin" || event.admin_id === req.user.id;
    if (!isOwner) return fail(res, "You don't have permission for this event", 403);

    const participant = event.participants.find((p) => p.id === payload.participant_id);
    if (!participant) return fail(res, "This ticket is no longer valid", 404);

    if (participant.entry) {
        return ok(res, { id: participant.id, name: participant.name, alreadyCheckedIn: true });
    }

    await Event.updateOne(
        { event_id: event.event_id, "participants.id": payload.participant_id },
        { $set: { "participants.$.entry": true } }
    );

    const user = await User.findOne({ user_token: payload.participant_id });
    if (user) {
        sendCheckInMail({
            name: user.username,
            regNo: user.reg_number,
            email: user.email,
            number: user.contactNumber,
            event: event.name,
        });
    }

    return ok(res, { id: participant.id, name: participant.name, alreadyCheckedIn: false });
};

module.exports = { getTicketQr, scanCheckin };
