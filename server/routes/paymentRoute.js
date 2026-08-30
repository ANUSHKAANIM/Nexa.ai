const express = require("express");
const router = express.Router();

const {
    getPaymentConfig,
    createOrder,
    verifyPayment,
    mockPayment,
} = require("../controllers/paymentController");
const { verifyToken, requireRole } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const asyncHandler = require("../middlewares/asyncHandler");
const {
    createOrderSchema,
    mockPaymentSchema,
    verifyPaymentSchema,
} = require("../schemas/paymentSchemas");

const requireUser = [verifyToken, requireRole("user")];

router
    .route("/payment/config")
    .get(...requireUser, asyncHandler(getPaymentConfig));
router
    .route("/payment/order")
    .post(
        ...requireUser,
        validate(createOrderSchema),
        asyncHandler(createOrder)
    );
router
    .route("/payment/verify")
    .post(
        ...requireUser,
        validate(verifyPaymentSchema),
        asyncHandler(verifyPayment)
    );
router
    .route("/payment/mock")
    .post(
        ...requireUser,
        validate(mockPaymentSchema),
        asyncHandler(mockPayment)
    );

module.exports = router;
