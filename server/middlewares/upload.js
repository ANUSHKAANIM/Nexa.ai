const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const storage = multer.diskStorage({
    destination: path.join(__dirname, "..", "uploads"),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${crypto.randomUUID()}${ext}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (!ALLOWED_TYPES.has(file.mimetype)) {
            return cb(new Error("Only JPEG, PNG, WEBP, or GIF images are allowed"));
        }
        cb(null, true);
    },
});

module.exports = upload;
