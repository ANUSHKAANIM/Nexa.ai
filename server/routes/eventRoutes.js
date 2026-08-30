const express = require("express");
const router = express.Router();

const {
    postEvent,
    updateEvent,
    myEvents,
    allEvents,
    particularEvent,
    deleteEvent,
    checkin,
} = require("../controllers/eventController");
const { getTicketQr, scanCheckin } = require("../controllers/ticketController");
const { joinWaitlist, cancelBooking } = require("../controllers/paymentController");
const { verifyToken, requireRole } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { validateQuery } = require("../middlewares/validate");
const asyncHandler = require("../middlewares/asyncHandler");
const {
    createEventSchema,
    updateEventSchema,
    eventIdSchema,
    checkinSchema,
    scanCheckinSchema,
    listEventsQuerySchema,
} = require("../schemas/eventSchemas");

const requireAdmin = [verifyToken, requireRole("admin", "superadmin")];
const requireUser = [verifyToken, requireRole("user")];

router
    .route("/post/event")
    .post(...requireAdmin, validate(createEventSchema), asyncHandler(postEvent));
router
    .route("/event/:event_id")
    .patch(
        ...requireAdmin,
        validate(updateEventSchema),
        asyncHandler(updateEvent)
    );
router
    .route("/event/mine")
    .get(...requireAdmin, validateQuery(listEventsQuerySchema), asyncHandler(myEvents));
router
    .route("/getallevents")
    .get(validateQuery(listEventsQuerySchema), asyncHandler(allEvents));
router
    .route("/getevent")
    .post(validate(eventIdSchema), asyncHandler(particularEvent));
router
    .route("/deleteevent")
    .post(...requireAdmin, validate(eventIdSchema), asyncHandler(deleteEvent));
router
    .route("/event/checkin")
    .post(...requireAdmin, validate(checkinSchema), asyncHandler(checkin));
router
    .route("/event/checkin/scan")
    .post(...requireAdmin, validate(scanCheckinSchema), asyncHandler(scanCheckin));

router
    .route("/event/:event_id/ticket-qr")
    .get(...requireUser, asyncHandler(getTicketQr));
router
    .route("/event/:event_id/waitlist")
    .post(...requireUser, asyncHandler(joinWaitlist));
router
    .route("/event/:event_id/cancel")
    .post(...requireUser, asyncHandler(cancelBooking));

module.exports = router;
