const { fail } = require("../libs/response");

const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        const message = result.error.issues[0]?.message || "Invalid request";
        return fail(res, message, 422);
    }
    req.body = result.data;
    next();
};

const validateQuery = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
        const message = result.error.issues[0]?.message || "Invalid query parameters";
        return fail(res, message, 422);
    }
    req.query = result.data;
    next();
};

module.exports = validate;
module.exports.validateQuery = validateQuery;
