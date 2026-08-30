import Image from "next/image";
import { FaUsers } from "react-icons/fa";
import { CalendarOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function EventCardSkeleton() {
    return (
        <div className="rounded-xl border border-border bg-card p-3">
            <Skeleton className="h-[16rem] w-full rounded-md" />
            <div className="flex flex-row justify-between items-start mt-4">
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                </div>
            </div>
        </div>
    );
}

function EventCard({ event, onClick, muted = false }) {
    return (
        <div
            onClick={onClick}
            className={`group rounded-xl border border-border bg-card shadow-sm px-3 py-3 transition-all ${
                onClick ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5" : ""
            } ${muted ? "grayscale opacity-80" : ""}`}
        >
            <div className="relative h-64 overflow-hidden rounded-md bg-muted">
                {event.profile && (
                    <Image
                        fill
                        className="object-cover"
                        src={event.profile}
                        alt=""
                        sizes="(min-width: 640px) 50vw, 100vw"
                    />
                )}
                {event.category && (
                    <Badge className="absolute top-2 left-2" variant="secondary">
                        {event.category}
                    </Badge>
                )}
            </div>
            <div className="flex flex-row justify-between items-start mt-4">
                <div className="px-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">
                        {event.name}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                        {event.venue}
                    </p>
                    <p className="text-sm text-muted-foreground">{event.date}</p>
                </div>
                <div className="flex flex-col items-end shrink-0">
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <FaUsers className="h-3.5 w-3.5" />
                        {event.participants?.length ?? 0}
                    </span>
                    <strong className="text-sm mt-2 whitespace-nowrap">
                        {event.price === 0 ? "Free" : `₹${event.price}`}
                    </strong>
                </div>
            </div>
        </div>
    );
}

function EventGrid({
    events,
    loading,
    onEventClick,
    muted,
    emptyTitle = "No events yet",
    emptyDescription,
    hasMore,
    onLoadMore,
}) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                    <EventCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (!events || events.length === 0) {
        return (
            <EmptyState
                icon={CalendarOff}
                title={emptyTitle}
                description={emptyDescription}
            />
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {events.map((event) => (
                    <EventCard
                        key={event._id || event.event_id}
                        event={event}
                        muted={muted}
                        onClick={onEventClick ? () => onEventClick(event) : undefined}
                    />
                ))}
            </div>
            {hasMore && (
                <div className="flex justify-center mt-6">
                    <Button variant="outline" onClick={onLoadMore}>
                        Load More
                    </Button>
                </div>
            )}
        </>
    );
}

export default EventGrid;
