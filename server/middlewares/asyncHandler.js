// Express 4 does not catch rejected promises from async route handlers on
// its own — an uncaught rejection here would otherwise crash the process
// (Node terminates on unhandled rejections by default). Wrap every async
// controller with this before registering it on a route.
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
