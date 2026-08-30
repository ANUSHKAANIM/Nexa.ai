const crypto = require("crypto");
const User = require("../models/user");
const { Event } = require("../models/event");
const { sendTicket } = require("./emailController");
const { ok, fail } = require("../libs/response");
const {
    paymentsAvailable,
    getClient,
    getClientForRefund,
    verifySignature,
} = require("../libs/payments");

// Registers `user` as a participant of `event` and emails their ticket.
// Shared by the real Razorpay path, the mock path, and free (price === 0)
// events, so all three behave identically past this point and switching
// PAYMENTS_ENABLED never requires touching this logic.
async function completeRegistration({ event, user, billingName, paymentId, mock }) {
    const passId = crypto.randomUUID();

    await Event.updateOne(
        { event_id: event.event_id },
        {
            $push: {
                participants: {
                    id: user.user_token,
                    name: user.username,
                    email: user.email,
                    passID: passId,
                    regno: user.reg_number,
                    entry: false,
                    paymentId: paymentId || null,
                },
            },
        }
    );

    // Snapshot the event plus this user's own ticket info — never the
    // event's full (unbounded, other-attendees') participants list.
    await User.updateOne(
        { user_token: user.user_token },
        {
            $push: {
                registeredEvents: {
                    event_id: event.event_id,
                    name: event.name,
                    venue: event.venue,
                    date: event.date,
                    time: event.time,
                    description: event.description,
                    price: event.price,
                    cover: event.cover,
                    profile: event.profile,
                    organizer: event.organizer,
                    category: event.category,
                    passID: passId,
                    entry: false,
                },
            },
        }
    );

    sendTicket({
        email: user.email,
        event_name: event.name,
        name: billingName || user.username,
        pass: passId,
        price: event.price,
        address1: "",
        city: "",
        zip: "",
    });

    return passId;
}

// If `event` has capacity headroom and a waitlist, registers the
// first-in-line waitlisted person exactly like a normal (free/mock)
// booking and removes them from the waitlist. Called after a cancellation
// frees a slot, or after an admin raises capacity.
async function promoteFromWaitlist(eventId) {
    const event = await Event.findOne({ event_id: eventId });
    if (!event || !event.waitlist.length) return;
    if (event.capacity != null && event.participants.length >= event.capacity) return;

    const next = event.waitlist[0];
    const user = await User.findOne({ user_token: next.id });

    await Event.updateOne(
        { event_id: eventId },
        { $pull: { waitlist: { id: next.id } } }
    );
    if (!user) return; // user deleted their account since joining the waitlist

    const alreadyRegistered = event.participants.some((p) => p.id === next.id);
    if (alreadyRegistered) return;

    await completeRegistration({ event, user, mock: true });
}

async function findBookableEvent(eventId, userId, res) {
    const event = await Event.findOne({ event_id: eventId });
    if (!event) {
        fail(res, "Event not found", 404);
        return null;
    }

    const alreadyRegistered = event.participants.some((p) => p.id === userId);
    if (alreadyRegistered) {
        ok(res, { status: "alreadyregistered" });
        return null;
    }

    if (event.capacity != null && event.participants.length >= event.capacity) {
        fail(res, "This event is full", 409, { status: "full" });
        return null;
    }

    return event;
}

// route - GET /payment/config  (authenticated user)
// Tells the client which flow to render — the only thing it needs to know
// up front to switch between the real and mock experience.
const getPaymentConfig = async (req, res) => {
    const enabled = paymentsAvailable();
    return ok(res, {
        enabled,
        keyId: enabled ? process.env.RAZORPAY_KEY_ID : null,
    });
};

// route - POST /payment/order  (authenticated user, real path only)
const createOrder = async (req, res) => {
    if (!paymentsAvailable()) {
        return fail(res, "Payments are not currently enabled", 400);
    }

    const { event_id } = req.body;
    const event = await findBookableEvent(event_id, req.user.id, res);
    if (!event) return; // response already sent by findBookableEvent

    const razorpay = getClient();
    const order = await razorpay.orders.create({
        amount: event.price * 100,
        currency: "INR",
        receipt: `${event.event_id}-${req.user.id}`.slice(0, 40),
    });

    return ok(res, {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
    });
};

// route - POST /payment/verify  (authenticated user, real path only)
const verifyPayment = async (req, res) => {
    if (!paymentsAvailable()) {
        return fail(res, "Payments are not currently enabled", 400);
    }

    const {
        event_id,
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
        billing_name: billingName,
    } = req.body;

    const validSignature = verifySignature({ orderId, paymentId, signature });
    if (!validSignature) {
        return fail(res, "Payment verification failed", 402, { status: "error" });
    }

    const event = await findBookableEvent(event_id, req.user.id, res);
    if (!event) return;

    const user = await User.findOne({ user_token: req.user.id });
    if (!user) return fail(res, "User is unauthorized", 401);

    await completeRegistration({ event, user, billingName, paymentId, mock: false });
    return ok(res, { status: "success", mock: false });
};

// route - POST /payment/mock  (authenticated user, free events + payments-disabled path)
// Skips the gateway entirely so the booking flow never blocks on payment
// configuration/availability. Only reachable for free events, or when
// PAYMENTS_ENABLED is off/unconfigured — a paid event with real payments on
// still requires the verified Razorpay path above.
const mockPayment = async (req, res) => {
    const { event_id, billing_name: billingName } = req.body;

    const event = await findBookableEvent(event_id, req.user.id, res);
    if (!event) return;

    if (event.price > 0 && paymentsAvailable()) {
        return fail(
            res,
            "Real payments are enabled for this event — use the Razorpay checkout",
            400
        );
    }

    const user = await User.findOne({ user_token: req.user.id });
    if (!user) return fail(res, "User is unauthorized", 401);

    await completeRegistration({ event, user, billingName, mock: true });
    return ok(res, { status: "success", mock: true });
};

// route - POST /event/:event_id/waitlist  (authenticated user)
const joinWaitlist = async (req, res) => {
    const event = await Event.findOne({ event_id: req.params.event_id });
    if (!event) return fail(res, "Event not found", 404);

    if (event.participants.some((p) => p.id === req.user.id)) {
        return fail(res, "You're already registered for this event", 400);
    }
    if (event.waitlist.some((w) => w.id === req.user.id)) {
        return ok(res, null, "You're already on the waitlist");
    }
    if (event.capacity == null || event.participants.length < event.capacity) {
        return fail(res, "This event isn't full — you can register directly", 400);
    }

    const user = await User.findOne({ user_token: req.user.id });
    if (!user) return fail(res, "User is unauthorized", 401);

    await Event.updateOne(
        { event_id: event.event_id },
        {
            $push: {
                waitlist: { id: user.user_token, name: user.username, email: user.email },
            },
        }
    );

    return ok(res, null, "You've been added to the waitlist");
};

// route - POST /event/:event_id/cancel  (authenticated user)
const cancelBooking = async (req, res) => {
    const event = await Event.findOne({ event_id: req.params.event_id });
    if (!event) return fail(res, "Event not found", 404);

    const participant = event.participants.find((p) => p.id === req.user.id);
    if (!participant) return fail(res, "You're not registered for this event", 404);
    if (participant.entry) {
        return fail(
            res,
            "You've already checked in to this event — contact the organizer to cancel",
            400
        );
    }

    if (participant.paymentId) {
        const razorpay = getClientForRefund();
        if (!razorpay) {
            return fail(
                res,
                "Refunds aren't available right now. Please contact support.",
                502
            );
        }
        try {
            await razorpay.payments.refund(participant.paymentId);
        } catch (error) {
            console.error("Refund failed:", error);
            return fail(res, "Refund failed. Please contact support.", 502);
        }
    }

    await Event.updateOne(
        { event_id: event.event_id },
        { $pull: { participants: { id: req.user.id } } }
    );
    await User.updateOne(
        { user_token: req.user.id },
        { $pull: { registeredEvents: { event_id: event.event_id } } }
    );

    await promoteFromWaitlist(event.event_id);

    return ok(res, null, "Booking cancelled");
};

module.exports = {
    getPaymentConfig,
    createOrder,
    verifyPayment,
    mockPayment,
    joinWaitlist,
    cancelBooking,
    promoteFromWaitlist,
};
