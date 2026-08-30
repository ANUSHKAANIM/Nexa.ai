import PageShell from "@/components/PageShell";
import EventForm from "@/components/EventForm";
import { apiPost } from "@/utils/api";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function EditEventPage() {
    const router = useRouter();
    const eventId = router.query.eventId;
    const [event, setEvent] = useState(null);

    useEffect(() => {
        if (!eventId) return;
        const fetchEvent = async () => {
            try {
                const data = await apiPost("/getevent", { event_id: eventId });
                setEvent(data);
            } catch (error) {
                console.error("Error fetching event data:", error.message);
            }
        };
        fetchEvent();
    }, [eventId]);

    return (
        <PageShell role="admin">
            <div className="container mx-auto px-4 pb-16 max-w-2xl">
                {event ? (
                    <EventForm
                        mode="edit"
                        eventId={eventId}
                        initialValues={event}
                        onSuccess={() =>
                            router.push(`/event/${eventId}/adminevents`)
                        }
                    />
                ) : (
                    <Skeleton className="h-[40rem] w-full rounded-xl" />
                )}
            </div>
        </PageShell>
    );
}

export default EditEventPage;
