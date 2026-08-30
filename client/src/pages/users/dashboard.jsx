import PageShell from "@/components/PageShell";
import EventFilters from "@/components/EventFilters";
import EventGrid from "@/components/EventGrid";
import { usePaginatedEvents } from "@/utils/usePaginatedEvents";
import { DEFAULT_FILTER_OPTIONS } from "@/utils/constants";
import { useRouter } from "next/router";
import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

function UserDashboard() {
    const router = useRouter();
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
    const [filterOptions, setFilterOptions] = useState(DEFAULT_FILTER_OPTIONS);

    const { events, loading, hasMore, loadMore } = usePaginatedEvents(
        "/getallevents",
        filterOptions
    );

    const handleClear = () => {
        setFilterOptions(DEFAULT_FILTER_OPTIONS);
        setMobileFilterOpen(false);
    };

    return (
        <PageShell role="user">
            <div className="container mx-auto px-4 pb-16">
                <div className="flex gap-8">
                    {/* Desktop filter sidebar */}
                    <aside className="hidden md:block w-64 shrink-0 sticky top-24 self-start">
                        <EventFilters
                            filterOptions={filterOptions}
                            setFilterOptions={setFilterOptions}
                            onClear={handleClear}
                        />
                    </aside>

                    <main className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-medium">Events</h2>
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
                            events={events}
                            loading={loading}
                            hasMore={hasMore}
                            onLoadMore={loadMore}
                            onEventClick={(event) =>
                                router.push(`/event/${event.event_id}`)
                            }
                            emptyTitle="No events match your filters"
                            emptyDescription="Try adjusting your keyword, category, or price range."
                        />
                    </main>
                </div>
            </div>

            {/* Mobile filter sheet */}
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

export default UserDashboard;
