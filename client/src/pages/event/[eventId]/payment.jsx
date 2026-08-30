import PageShell from "@/components/PageShell";
import { apiGet, apiPost } from "@/utils/api";
import Head from "next/head";
import Script from "next/script";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function Payment() {
    const router = useRouter();
    const event_id = router.query.eventId;

    const [event, setEvent] = useState(null);
    const [user, setUser] = useState(null);
    const [paymentConfig, setPaymentConfig] = useState({ enabled: false });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!event_id) return;

        const load = async () => {
            try {
                const [eventData, userData, configData] = await Promise.all([
                    apiPost("/getevent", { event_id }),
                    apiGet("/user/details"),
                    apiGet("/payment/config"),
                ]);
                setEvent(eventData);
                setUser(userData);
                setPaymentConfig(configData);
            } catch (err) {
                setError(err.message);
            }
        };

        load();
    }, [event_id]);

    const isFree = event?.price === 0;

    // Any successful booking (real, mock, or free) lands here — one shared
    // finishing step, regardless of which of the three paths produced it.
    const finishBooking = (result) => {
        if (result.status === "alreadyregistered") {
            toast.info("You're already registered for this event.");
        } else if (result.mock) {
            toast.success("Booking confirmed — demo mode, no payment was charged.");
        } else {
            toast.success("Payment successful — booking confirmed!");
        }
        router.push("/users/dashboard");
    };

    const handleFreeOrMockBooking = async () => {
        setSubmitting(true);
        setError("");
        try {
            const result = await apiPost("/payment/mock", {
                event_id,
                billing_name: user?.username,
            });
            finishBooking(result);
        } catch (err) {
            if (err.data?.status === "full") {
                setError("This event is full.");
            } else {
                setError(err.message);
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleRazorpayPayment = async () => {
        setSubmitting(true);
        setError("");
        try {
            const order = await apiPost("/payment/order", { event_id });

            const razorpay = new window.Razorpay({
                key: order.keyId,
                amount: order.amount,
                currency: order.currency,
                order_id: order.orderId,
                name: "NEXA",
                description: `Ticket for ${event.name}`,
                prefill: {
                    name: user?.username,
                    email: user?.email,
                    contact: user?.contactNumber,
                },
                theme: { color: "#B106CD" },
                handler: async (response) => {
                    try {
                        const result = await apiPost("/payment/verify", {
                            event_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            billing_name: user?.username,
                        });
                        finishBooking(result);
                    } catch (err) {
                        setError(err.message);
                    } finally {
                        setSubmitting(false);
                    }
                },
                modal: {
                    ondismiss: () => setSubmitting(false),
                },
            });
            razorpay.open();
        } catch (err) {
            setError(err.message);
            setSubmitting(false);
        }
    };

    const handlePay = isFree || !paymentConfig.enabled
        ? handleFreeOrMockBooking
        : handleRazorpayPayment;

    return (
        <PageShell role="user">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />
            <Head>
                <title>{event ? `Checkout — ${event.name}` : "Checkout"}</title>
            </Head>
            <div className="container mx-auto px-4 max-w-md">
                {!event ? (
                    <Skeleton className="h-64 w-full rounded-xl" />
                ) : (
                    <div className="bg-card border border-border rounded-xl shadow-sm p-6">
                        <h1 className="text-2xl font-bold mb-1">{event.name}</h1>
                        <p className="text-muted-foreground mb-6">
                            {isFree ? "Free event" : `₹${event.price}`}
                        </p>

                        {!isFree && !paymentConfig.enabled && (
                            <div className="text-sm text-muted-foreground bg-muted rounded-lg p-3 mb-4">
                                Demo mode — payments aren&apos;t configured on this
                                deployment, so this booking won&apos;t be charged.
                            </div>
                        )}

                        {error && (
                            <div className="text-sm text-destructive bg-destructive/10 rounded-lg p-3 mb-4">
                                {error}
                            </div>
                        )}

                        <Button onClick={handlePay} disabled={submitting} size="lg" className="w-full">
                            {submitting
                                ? "Please wait..."
                                : isFree
                                ? "Confirm Free Registration"
                                : paymentConfig.enabled
                                ? "Pay with Razorpay"
                                : "Confirm Booking"}
                        </Button>
                    </div>
                )}
            </div>
        </PageShell>
    );
}
