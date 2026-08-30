const ok = (res, data, message = "", status = 200) =>
    res.status(status).json({ success: true, data, message });

const fail = (res, message, status = 400, data = null) =>
    res.status(status).json({ success: false, data, message });

module.exports = { ok, fail };
