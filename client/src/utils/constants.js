// Keep in sync with server/schemas/eventSchemas.js CATEGORIES
export const EVENT_CATEGORIES = [
    "Technical",
    "Cultural",
    "Workshop",
    "Sports",
    "Other",
];

export const DEFAULT_FILTER_OPTIONS = {
    keyword: "",
    category: "",
    dateRange: "",
    price: [0, 3000],
};
