const jwt = require("jsonwebtoken");
const QRCode = require("qrcode");

// A ticket's QR encodes a signed token (not the raw participant id) so it
// can't be forged or replayed for a different event — verified server-side
// on scan, never trusted from the client.
const signCheckinToken = (eventId, participantId) =>
    jwt.sign(
        { event_id: eventId, participant_id: participantId, purpose: "checkin" },
        process.env.JWT_SECRET,
        { expiresIn: "180d" }
    );

const verifyCheckinToken = (token) => {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.purpose !== "checkin") {
        throw new Error("Invalid ticket token");
    }
    return payload;
};

const toQrDataUrl = (token) => QRCode.toDataURL(token, { margin: 1, width: 280 });

module.exports = { signCheckinToken, verifyCheckinToken, toQrDataUrl };
