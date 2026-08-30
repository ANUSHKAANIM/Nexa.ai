import { useState, useEffect } from "react";

// Shared by every event-list page (user/admin dashboard, past events) —
// previously this exact predicate was copy-pasted three times, and none of
// the copies actually checked `category` even though the filter UI collects
// one.
export function useFilteredEvents(events, filterOptions) {
    const [filteredEvents, setFilteredEvents] = useState(events);

    useEffect(() => {
        const result = events.filter((event) => {
            if (
                filterOptions.keyword.toLowerCase() &&
                !event.name.toLowerCase().includes(filterOptions.keyword.toLowerCase())
            ) {
                return false;
            }

            if (filterOptions.category && event.category !== filterOptions.category) {
                return false;
            }

            if (filterOptions.dateRange) {
                const dateParts = event.date.split("/");
                const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
                if (formattedDate < filterOptions.dateRange) {
                    return false;
                }
            }

            if (
                event.price < filterOptions.price[0] ||
                event.price > filterOptions.price[1]
            ) {
                return false;
            }

            return true;
        });

        setFilteredEvents(result);
    }, [events, filterOptions]);

    return filteredEvents;
}
