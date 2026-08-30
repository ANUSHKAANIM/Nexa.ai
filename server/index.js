const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");

const cors = require("cors");

const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const authRouter = require("./routes/authRoutes");
const dashboardRouter = require("./routes/userDashboardRoutes");
const paymentRouter = require("./routes/paymentRoute");
const adminRouter = require("./routes/adminRoutes");
const eventRouter = require("./routes/eventRoutes");
const sessionRouter = require("./routes/sessionRoutes");
const uploadRouter = require("./routes/uploadRoute");
const { fail } = require("./libs/response");

dotenv.config();

// Behind Vercel's proxy, req.ip otherwise resolves to the proxy's own
// address for every request — express-rate-limit (and anything else keying
// on IP) would then treat every visitor as one caller sharing one bucket.
// Only trust the forwarded IP when actually running behind a known proxy,
// not on a bare/self-hosted server where that header could be spoofed.
if (process.env.VERCEL) {
    app.set("trust proxy", 1);
}

// On Vercel each request can hit a fresh serverless invocation reusing a
// warm module cache — connecting unconditionally would pile up a new
// connection per invocation. mongoose.connection.readyState covers both
// "already connected" (1) and "currently connecting" (2).
if (![1, 2].includes(mongoose.connection.readyState)) {
    mongoose
        .connect(process.env.MONGO_ATLAS_URI)
        .then(() => {
            console.log("Connected to MongoDB");
        })
        .catch((err) => {
            console.log(err);
        });
}

require("./models/otpAuth");
require("./models/user");
require("./models/admin");
require("./models/event");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cookieParser());
app.use(
    cors({
        origin: process.env.DEPLOYED_URL,
        credentials: true,
    })
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/", sessionRouter);
app.use("/", paymentRouter);
app.use("/user", authRouter);
app.use("/user", dashboardRouter);

app.use("/", adminRouter);
app.use("/", eventRouter);
app.use("/", uploadRouter);

app.get("/", (req, res) => {
    res.send("Event Management micro services API.");
});

// Catch-all error handler — every route is wrapped in asyncHandler, so any
// thrown/rejected error from a controller ends up here instead of crashing
// the process or leaking a raw stack trace to the client.
app.use((err, req, res, next) => {
    console.error(err);
    fail(res, "Something went wrong. Please try again.", 500);
});

// Vercel imports this file as a serverless function and calls the exported
// app directly — it must not also call app.listen(), which would try (and
// fail) to bind a persistent port in that environment.
if (process.env.VERCEL) {
    module.exports = app;
} else {
    app.listen(`${process.env.PORT}`, () => {
        console.log(`Server Running on🚀: ${process.env.PORT}`);
    });
}
