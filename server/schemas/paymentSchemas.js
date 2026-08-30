const { z } = require("zod");

const createOrderSchema = z.object({
    event_id: z.string().trim().min(1, "event_id is required"),
});

const mockPaymentSchema = z.object({
    event_id: z.string().trim().min(1, "event_id is required"),
    billing_name: z.string().trim().optional(),
});

const verifyPaymentSchema = z.object({
    event_id: z.string().trim().min(1, "event_id is required"),
    razorpay_order_id: z.string().min(1),
    razorpay_payment_id: z.string().min(1),
    razorpay_signature: z.string().min(1),
    billing_name: z.string().trim().optional(),
});

module.exports = { createOrderSchema, mockPaymentSchema, verifyPaymentSchema };
