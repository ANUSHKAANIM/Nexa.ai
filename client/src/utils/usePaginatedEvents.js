import { useEffect, useRef, useState } from "react";
import { apiGet } from "@/utils/api";
import { DEFAULT_FILTER_OPTIONS } from "@/utils/constants";

function buildQuery(filterOptions, page) {
    const params = new URLSearchParams();
    params.set("page", page);
    params.set("limit", "24");
    if (filterOptions.keyword) params.set("q", filterOptions.keyword);
    if (filterOptions.category) params.set("category", filterOptions.category);
    if (filterOptions.dateRange) params.set("dateFrom", filterOptions.dateRange);
    if (filterOptions.price[0] > DEFAULT_FILTER_OPTIONS.price[0]) {
        params.set("priceMin", filterOptions.price[0]);
    }
    if (filterOptions.price[1] < DEFAULT_FILTER_OPTIONS.price[1]) {
        params.set("priceMax", filterOptions.price[1]);
    }
    return params.toString();
}

// Filters/paginates server-side (via /getallevents or /event/mine) instead
// of fetching every event and filtering client-side — the pattern every
// event-list page used to duplicate, which stops scaling past a few hundred
// events. Filter changes are debounced so typing a keyword doesn't fire a
// request per keystroke.
export function usePaginatedEvents(endpoint, filterOptions) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const requestId = useRef(0);

    const fetchPage = async (targetPage, append) => {
        const thisRequest = ++requestId.current;
        if (!append) setLoading(true);
        try {
            const data = await apiGet(`${endpoint}?${buildQuery(filterOptions, targetPage)}`);
            if (thisRequest !== requestId.current) return; // a newer request superseded this one
            setEvents((prev) => (append ? [...prev, ...data.events] : data.events));
            setPage(data.page);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error("Failed to fetch events:", error.message);
        } finally {
            if (thisRequest === requestId.current) setLoading(false);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(() => fetchPage(1, false), 300);
        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        endpoint,
        filterOptions.keyword,
        filterOptions.category,
        filterOptions.dateRange,
        filterOptions.price[0],
        filterOptions.price[1],
    ]);

    const loadMore = () => fetchPage(page + 1, true);

    return { events, loading, hasMore: page < totalPages, loadMore };
}
