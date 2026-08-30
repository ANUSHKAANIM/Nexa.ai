import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { EVENT_CATEGORIES, DEFAULT_FILTER_OPTIONS } from "@/utils/constants";

// Single filter form shared by every event-list page (user/admin dashboard,
// past events) — rendered inline on desktop and inside a Sheet on mobile.
// Previously duplicated near-identically across Dashboard_Filter/Popup_Filter.
function EventFilters({ filterOptions = DEFAULT_FILTER_OPTIONS, setFilterOptions, onClear }) {
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilterOptions({ ...filterOptions, [name]: value });
    };

    const handlePriceChange = (value) => {
        setFilterOptions({ ...filterOptions, price: value });
    };

    return (
        <div className="flex flex-col gap-4">
            <h2 className="text-lg font-medium">Filter Events</h2>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="keyword">Keyword</Label>
                <Input
                    id="keyword"
                    name="keyword"
                    value={filterOptions.keyword}
                    onChange={handleInputChange}
                    placeholder="Search by keyword..."
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="category">Category</Label>
                <Select
                    value={filterOptions.category || "all"}
                    onValueChange={(value) =>
                        setFilterOptions({
                            ...filterOptions,
                            category: value === "all" ? "" : value,
                        })
                    }
                >
                    <SelectTrigger id="category">
                        <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All categories</SelectItem>
                        {EVENT_CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>
                                {category}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="dateRange">From date</Label>
                <Input
                    id="dateRange"
                    name="dateRange"
                    type="date"
                    value={filterOptions.dateRange}
                    onChange={handleInputChange}
                />
            </div>

            <div className="flex flex-col gap-2">
                <Label>Price</Label>
                <Slider
                    range
                    min={0}
                    max={3000}
                    step={10}
                    value={filterOptions.price}
                    onChange={handlePriceChange}
                />
                <p className="text-sm text-muted-foreground">
                    ₹{filterOptions.price[0]} - ₹{filterOptions.price[1]}
                </p>
            </div>

            <Button variant="outline" onClick={onClear} className="mt-2">
                Clear Filters
            </Button>
        </div>
    );
}

export default EventFilters;
