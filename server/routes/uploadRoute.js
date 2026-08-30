const express = require("express");
const router = express.Router();

const { uploadImage } = require("../controllers/uploadController");
const { verifyToken, requireRole } = require("../middlewares/auth");
const upload = require("../middlewares/upload");
const asyncHandler = require("../middlewares/asyncHandler");
const { fail } = require("../libs/response");

router.route("/upload").post(
    verifyToken,
    requireRole("admin", "superadmin"),
    (req, res, next) => {
        upload.single("image")(req, res, (err) => {
            if (err) return fail(res, err.message, 400);
            next();
        });
    },
    asyncHandler(uploadImage)
);

module.exports = router;
