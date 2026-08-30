import PageShell from "@/components/PageShell";
import { apiPost } from "@/utils/api";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Pencil, Share2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function AdminEventPage() {
    const router = useRouter();
    const eventId = router.query.eventId;
    const [eventData, setEventData] = useState(null);

    useEffect(() => {
        if (!eventId) return;
        const fetchEvent = async () => {
            try {
                const data = await apiPost("/getevent", { event_id: eventId });
                setEventData(data);
            } catch (error) {
                console.error("Error fetching event data:", error.message);
            }
        };
        fetchEvent();
    }, [eventId]);

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

    const deleteEvent = async () => {
        try {
            await apiPost("/deleteevent", { event_id: eventId });
            toast.success("Event deleted");
            router.push("/admin/dashboard");
        } catch (error) {
            toast.error(error.message || "Failed to delete event. Please try again.");
        }
    };

    if (!eventData) {
        return (
            <PageShell role="admin">
                <div className="container mx-auto px-4">
                    <Skeleton className="h-64 w-full rounded-xl mb-4" />
                    <Skeleton className="h-40 w-full rounded-xl" />
                </div>
            </PageShell>
        );
    }

    const createdAt = new Date(eventData.createdAt);

    return (
        <PageShell role="admin">
            <Head>
                <title>{eventData.name}</title>
            </Head>
            <div className="container mx-auto px-4 pb-16">
                <div className="relative h-56 sm:h-96 overflow-hidden rounded-xl shadow-md">
                    {eventData.cover && (
                        <Image
                            src={eventData.cover}
                            alt={eventData.name}
                            fill
                            className="object-cover"
                        />
                    )}
                    {eventData.category && (
                        <Badge className="absolute top-3 left-3">
                            {eventData.category}
                        </Badge>
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
                        <div className="flex gap-2 shrink-0">
                            <Button
                                variant="outline"
                                onClick={() => router.push(`/event/${eventId}/edit`)}
                                className="gap-2"
                            >
                                <Pencil className="h-4 w-4" />
                                Edit
                            </Button>
                            <Button
                                onClick={() => router.push(`/event/${eventId}/registration`)}
                                className="gap-2"
                            >
                                <Users className="h-4 w-4" />
                                Registrations
                            </Button>
                        </div>
                    </div>

                    <div className="border-t border-border mt-6 pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h3 className="font-semibold mb-1">Ticket Pricing</h3>
                            <p className="text-muted-foreground">
                                {eventData.price === 0 ? "Free event" : `₹${eventData.price}`}
                                {eventData.capacity ? ` · Capacity ${eventData.capacity}` : ""}
                            </p>
                        </div>
                        <Button variant="secondary" onClick={share} className="gap-2 w-fit">
                            <Share2 className="h-4 w-4" />
                            Share
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4 mt-4">
                    <div className="bg-card border border-border rounded-xl shadow-sm p-6">
                        <h3 className="font-semibold mb-2">About the Event</h3>
                        <p className="text-muted-foreground">{eventData.description}</p>
                    </div>

                    <div className="bg-card border border-border rounded-xl shadow-sm p-6 flex flex-col gap-4">
                        <h3 className="font-semibold">Event Overview</h3>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Total Registrations</span>
                            <span>{eventData.participants?.length ?? 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Created At</span>
                            <span>
                                {createdAt.toLocaleDateString()} at{" "}
                                {createdAt.toLocaleTimeString("en-US", { hour12: false })}
                            </span>
                        </div>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="w-full mt-2">
                                    Delete this event
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete this event?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will permanently delete the event and all
                                        associated registration data. This action cannot
                                        be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={deleteEvent}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </div>
        </PageShell>
    );
}

export default AdminEventPage;
