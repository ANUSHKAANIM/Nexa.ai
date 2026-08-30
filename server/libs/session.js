const jwt = require("jsonwebtoken");

const COOKIE_NAME = "token";
const SESSION_TTL = "7d";

// The client and server are deployed to separate *.vercel.app subdomains,
// which browsers treat as different sites (vercel.app is on the public
// suffix list) — so the client's cross-site fetch() calls only carry this
// cookie if it's SameSite=None, which in turn requires Secure. Locally both
// run on http://localhost, where Secure cookies aren't sent at all, so this
// stays Lax/non-Secure there.
const isDeployed = !!process.env.VERCEL;
const cookieOptions = {
    httpOnly: true,
    secure: isDeployed,
    sameSite: isDeployed ? "none" : "lax",
    path: "/",
};

const issueSession = (res, { id, role }) => {
    const token = jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: SESSION_TTL,
    });
    res.cookie(COOKIE_NAME, token, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
};

const clearSession = (res) => {
    res.clearCookie(COOKIE_NAME, cookieOptions);
};

module.exports = { issueSession, clearSession, COOKIE_NAME };
