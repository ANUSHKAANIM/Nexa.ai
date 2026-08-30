import PageShell from "@/components/PageShell";
import { apiGet, apiPost } from "@/utils/api";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

function EventPage() {
    const router = useRouter();
    const eventId = router.query.eventId;
    const [eventData, setEventData] = useState(null);
    const [isUserRegistered, setIsUserRegistered] = useState(false);
    const [isWaitlisted, setIsWaitlisted] = useState(false);
    const [waitlistSubmitting, setWaitlistSubmitting] = useState(false);

    const share = () => {
        if (navigator.share) {
            navigator
                .share({
                    title: eventData.name,
                    text: "Check out this event!",
                    url: window.location.href,
                })
                .catch(() => {});
        }
    };

    useEffect(() => {
        if (!eventId) return;

        const fetchEvent = async () => {
            try {
                const data = await apiPost("/getevent", { event_id: eventId });
                setEventData(data);
            } catch (error) {
                console.error("Error fetching event data:", error.message);
            }

            // Best-effort: only signed-in attendees have a /user/details
            // session; an anonymous or admin visitor just sees the
            // unregistered state.
            try {
                const user = await apiGet("/user/details");
                setIsUserRegistered(
                    (user.registeredEvents || []).some((e) => e.event_id === eventId)
                );
            } catch (error) {
                setIsUserRegistered(false);
            }
        };

        fetchEvent();
    }, [eventId]);

    if (!eventData) {
        return (
            <PageShell role="user">
                <div className="container mx-auto px-4">
                    <Skeleton className="h-64 sm:h-96 w-full rounded-xl mb-4" />
                    <Skeleton className="h-32 w-full rounded-xl" />
                </div>
            </PageShell>
        );
    }

    const isFree = eventData.price === 0;
    const isFull =
        eventData.capacity != null &&
        (eventData.participants?.length ?? 0) >= eventData.capacity;

    const handleJoinWaitlist = async () => {
        setWaitlistSubmitting(true);
        try {
            await apiPost(`/event/${eventId}/waitlist`);
            toast.success("You've been added to the waitlist");
            setIsWaitlisted(true);
        } catch (error) {
            toast.error(error.message || "Failed to join the waitlist.");
        } finally {
            setWaitlistSubmitting(false);
        }
    };

    const handleCtaClick = isFull && !isUserRegistered ? handleJoinWaitlist : () =>
        router.push(`/event/${eventId}/payment`);

    const ctaLabel = isUserRegistered
        ? "Already Registered"
        : isWaitlisted
        ? "On Waitlist"
        : isFull
        ? "Join Waitlist"
        : isFree
        ? "Register (Free)"
        : "Buy Tickets";
    const ctaDisabled = isUserRegistered || isWaitlisted || waitlistSubmitting;

    return (
        <PageShell role="user" stickyFooter className="lg:pb-8">
            <Head>
                <title>{eventData.name}</title>
                <meta
                    name="description"
                    content={`${eventData.name} at ${eventData.venue} on ${eventData.date} — book your ticket on NEXA.`}
                />
            </Head>
            <div className="container mx-auto px-4">
                <div className="relative h-56 sm:h-96 overflow-hidden rounded-xl shadow-md">
                    {eventData.cover && (
                        <Image
                            src={eventData.cover}
                            alt={eventData.name}
                            fill
                            className="object-cover"
                            priority
                        />
                    )}
                    {eventData.category && (
                        <Badge className="absolute top-3 left-3">{eventData.category}</Badge>
                    )}
                </div>

                <div className="bg-card border border-border rounded-xl shadow-sm p-6 mt-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">{eventData.name}</h1>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                <span><strong className="text-foreground">Date:</strong> {eventData.date}</span>
                                <span><strong className="text-foreground">Time:</strong> {eventData.time}</span>
                                <span><strong className="text-foreground">Venue:</strong> {eventData.venue}</span>
                                <span><strong className="text-foreground">Organizer:</strong> {eventData.organizer}</span>
                            </div>
                        </div>
                        <Button
                            size="lg"
                            className="hidden lg:inline-flex"
                            disabled={ctaDisabled}
                            onClick={handleCtaClick}
                        >
                            {ctaLabel}
                        </Button>
                    </div>

                    <div className="border-t border-border mt-6 pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h3 className="font-semibold mb-1">Ticket Price</h3>
                            <p className="text-muted-foreground">
                                {isFree ? "Free" : `₹${eventData.price}`}
                            </p>
                        </div>
                        <Button variant="secondary" onClick={share} className="gap-2 w-fit">
                            <Share2 className="h-4 w-4" />
                            Share
                        </Button>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-xl shadow-sm p-6 mt-4">
                    <h3 className="font-semibold mb-2">About the Event</h3>
                    <p className="text-muted-foreground">{eventData.description}</p>
                </div>
            </div>

            {/* Sticky mobile CTA so it stays reachable while scrolling */}
            <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 lg:hidden z-30">
                <Button
                    size="lg"
                    className="w-full"
                    disabled={ctaDisabled}
                    onClick={handleCtaClick}
                >
                    {ctaLabel} {!isFree && !isUserRegistered && !isFull && `· ₹${eventData.price}`}
                </Button>
            </div>
        </PageShell>
    );
}

export default EventPage;
