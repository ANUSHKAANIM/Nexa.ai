const crypto = require("crypto");
const Razorpay = require("razorpay");

// Single source of truth for "are real payments actually usable right now".
// Never trust a client-supplied flag for this — it's computed from server
// config only, so flipping PAYMENTS_ENABLED is the only way to switch modes
// and nothing else in the app needs to change when it flips.
const paymentsAvailable = () =>
    process.env.PAYMENTS_ENABLED === "true" &&
    Boolean(process.env.RAZORPAY_KEY_ID) &&
    Boolean(process.env.RAZORPAY_KEY_SECRET);

const keysConfigured = () =>
    Boolean(process.env.RAZORPAY_KEY_ID) && Boolean(process.env.RAZORPAY_KEY_SECRET);

let client = null;
const buildClient = () => {
    if (!keysConfigured()) return null;
    if (!client) {
        client = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    }
    return client;
};

// For starting new payments — gated by the feature flag.
const getClient = () => (paymentsAvailable() ? buildClient() : null);

// For refunding a payment that was already taken — a real charge exists
// regardless of whether PAYMENTS_ENABLED has since been turned off, so this
// only depends on the keys still being configured, not the flag.
const getClientForRefund = () => (keysConfigured() ? buildClient() : null);

const verifySignature = ({ orderId, paymentId, signature }) => {
    const expected = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");
    return expected === signature;
};

module.exports = { paymentsAvailable, getClient, getClientForRefund, verifySignature };
