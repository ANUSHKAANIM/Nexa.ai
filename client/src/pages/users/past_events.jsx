import PageShell from "@/components/PageShell";
import EventFilters from "@/components/EventFilters";
import EventGrid from "@/components/EventGrid";
import { apiGet, apiPost } from "@/utils/api";
import { useFilteredEvents } from "@/utils/useFilteredEvents";
import { DEFAULT_FILTER_OPTIONS } from "@/utils/constants";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SlidersHorizontal, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

function PastEvents() {
    const [pastEvents, setPastEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
    const [filterOptions, setFilterOptions] = useState(DEFAULT_FILTER_OPTIONS);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [qrDataUrl, setQrDataUrl] = useState(null);
    const [cancelling, setCancelling] = useState(false);

    const fetchPastEvents = async () => {
        try {
            const data = await apiGet("/user/details");
            setPastEvents(data.registeredEvents || []);
        } catch (error) {
            console.error("Failed to fetch past events:", error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPastEvents();
    }, []);

    useEffect(() => {
        if (!selectedTicket) {
            setQrDataUrl(null);
            return;
        }
        apiGet(`/event/${selectedTicket.event_id}/ticket-qr`)
            .then((data) => setQrDataUrl(data.qrDataUrl))
            .catch(() => setQrDataUrl(null));
    }, [selectedTicket]);

    const filteredEvents = useFilteredEvents(pastEvents, filterOptions);

    const handleClear = () => {
        setFilterOptions(DEFAULT_FILTER_OPTIONS);
        setMobileFilterOpen(false);
    };

    const handleCancel = async () => {
        setCancelling(true);
        try {
            await apiPost(`/event/${selectedTicket.event_id}/cancel`);
            toast.success("Booking cancelled");
            setSelectedTicket(null);
            fetchPastEvents();
        } catch (error) {
            toast.error(error.message || "Failed to cancel booking.");
        } finally {
            setCancelling(false);
        }
    };

    return (
        <PageShell role="user">
            <div className="container mx-auto px-4 pb-16">
                <div className="flex gap-8">
                    <aside className="hidden md:block w-64 shrink-0 sticky top-24 self-start">
                        <EventFilters
                            filterOptions={filterOptions}
                            setFilterOptions={setFilterOptions}
                            onClear={handleClear}
                        />
                    </aside>

                    <main className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-medium">Past Events</h2>
                            <Button
                                variant="outline"
                                size="sm"
                                className="md:hidden gap-2"
                                onClick={() => setMobileFilterOpen(true)}
                            >
                                <SlidersHorizontal className="h-4 w-4" />
                                Filters
                            </Button>
                        </div>
                        <EventGrid
                            events={filteredEvents}
                            loading={loading}
                            muted
                            onEventClick={(event) => setSelectedTicket(event)}
                            emptyTitle="No past events"
                            emptyDescription="Tickets you book will show up here."
                        />
                    </main>
                </div>
            </div>

            <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
                <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
                    <SheetTitle className="sr-only">Filter Events</SheetTitle>
                    <EventFilters
                        filterOptions={filterOptions}
                        setFilterOptions={setFilterOptions}
                        onClear={handleClear}
                    />
                </SheetContent>
            </Sheet>

            <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
                <DialogContent>
                    {selectedTicket && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Ticket className="h-5 w-5 text-primary" />
                                    {selectedTicket.name}
                                </DialogTitle>
                                <DialogDescription>
                                    {selectedTicket.venue} · {selectedTicket.date}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="flex justify-center py-2">
                                {qrDataUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={qrDataUrl} alt="Ticket QR code" className="h-40 w-40" />
                                ) : (
                                    <Skeleton className="h-40 w-40" />
                                )}
                            </div>

                            <div className="flex flex-col gap-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Pass number</span>
                                    <span className="font-mono">{selectedTicket.passID}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Status</span>
                                    <Badge variant={selectedTicket.entry ? "success" : "secondary"}>
                                        {selectedTicket.entry ? "Checked in" : "Not checked in"}
                                    </Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Amount paid</span>
                                    <span>{selectedTicket.price === 0 ? "Free" : `₹${selectedTicket.price}`}</span>
                                </div>
                            </div>

                            {!selectedTicket.entry && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" className="w-full mt-2">
                                            Cancel Registration
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Cancel this registration?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                {selectedTicket.price > 0
                                                    ? "If this was a paid booking, a refund will be issued automatically."
                                                    : "This will free up your spot for this event."}
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Keep it</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={handleCancel}
                                                disabled={cancelling}
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            >
                                                {cancelling ? "Cancelling..." : "Cancel Registration"}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </PageShell>
    );
}

export default PastEvents;
