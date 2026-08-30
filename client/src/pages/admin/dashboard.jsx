import PageShell from "@/components/PageShell";
import EventFilters from "@/components/EventFilters";
import EventGrid from "@/components/EventGrid";
import { usePaginatedEvents } from "@/utils/usePaginatedEvents";
import { DEFAULT_FILTER_OPTIONS } from "@/utils/constants";
import { useRouter } from "next/router";
import { useState } from "react";
import { Plus, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

function AdminDashboard() {
    const router = useRouter();
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
    const [filterOptions, setFilterOptions] = useState(DEFAULT_FILTER_OPTIONS);

    const { events, loading, hasMore, loadMore } = usePaginatedEvents(
        "/event/mine",
        filterOptions
    );

    const handleClear = () => {
        setFilterOptions(DEFAULT_FILTER_OPTIONS);
        setMobileFilterOpen(false);
    };

    return (
        <PageShell role="admin">
            <div className="container mx-auto px-4 pb-24">
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
                            <h2 className="text-lg font-medium">Your Events</h2>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="md:hidden gap-2"
                                    onClick={() => setMobileFilterOpen(true)}
                                >
                                    <SlidersHorizontal className="h-4 w-4" />
                                    Filters
                                </Button>
                                <Button
                                    size="sm"
                                    className="gap-2"
                                    onClick={() => router.push("/admin/eventform")}
                                >
                                    <Plus className="h-4 w-4" />
                                    Create Event
                                </Button>
                            </div>
                        </div>
                        <EventGrid
                            events={events}
                            loading={loading}
                            hasMore={hasMore}
                            onLoadMore={loadMore}
                            onEventClick={(event) =>
                                router.push(`/event/${event.event_id}/adminevents`)
                            }
                            emptyTitle="No events yet"
                            emptyDescription="Create your first event to get started."
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
        </PageShell>
    );
}

export default AdminDashboard;
