const { ok, fail } = require("../libs/response");

// route - POST /upload  (admin/superadmin, multipart/form-data field "image")
const uploadImage = async (req, res) => {
    if (!req.file) return fail(res, "No image uploaded", 400);
    return ok(res, { url: `/uploads/${req.file.filename}` });
};

module.exports = { uploadImage };
