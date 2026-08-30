import { apiPost, apiPatch, apiUpload } from "@/utils/api";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { EVENT_CATEGORIES } from "@/utils/constants";

// URL input or upload-a-file, either one sets the same string field — the
// rest of the form just sees a URL either way.
function ImageField({ id, label, value, onChange }) {
    const [uploading, setUploading] = useState(false);

    const handleFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const result = await apiUpload("/upload", file);
            // The server returns a path relative to itself (e.g. /uploads/x.jpg),
            // not the client — resolve it against the API origin so <img> can load it.
            onChange(`${process.env.NEXT_PUBLIC_API_URL}${result.url}`);
            toast.success(`${label} uploaded`);
        } catch (error) {
            toast.error(error.message || "Upload failed");
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    };

    return (
        <div className="flex flex-col gap-1.5">
            <Label htmlFor={id}>{label}</Label>
            <div className="flex gap-2">
                <Input
                    id={id}
                    type="url"
                    placeholder="Paste a URL..."
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
                <Button type="button" variant="outline" size="icon" className="relative shrink-0" disabled={uploading}>
                    <Upload className="h-4 w-4" />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFile}
                        disabled={uploading}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                </Button>
            </div>
            {value && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={value}
                    alt=""
                    className="h-20 w-20 object-cover rounded-md mt-1"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                    onLoad={(e) => (e.currentTarget.style.display = "block")}
                />
            )}
        </div>
    );
}

const emptyForm = {
    name: "",
    venue: "",
    organizer: "",
    datetime: "",
    date: "",
    time: "",
    price: "",
    profile: "",
    cover: "",
    description: "",
    category: "",
    capacity: "",
};

// Shared by both "create event" (/admin/eventform) and "edit event"
// (from an admin's own event page) — previously two copies would have been
// needed since the form has non-trivial submit/validation logic.
function EventForm({ mode = "create", eventId, initialValues, onSuccess }) {
    const router = useRouter();
    const [formData, setFormData] = useState({ ...emptyForm, ...initialValues });
    const [isFree, setIsFree] = useState(initialValues?.price === 0);
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        let date = formData.date;
        let time = formData.time;
        if (mode === "create") {
            const dt = new Date(formData.datetime);
            date = dt.toLocaleDateString("en-IN", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            });
            time = dt.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "numeric",
                hour12: true,
            });
        }

        const body = {
            name: formData.name,
            venue: formData.venue,
            organizer: formData.organizer,
            date,
            time,
            description: formData.description,
            price: isFree ? 0 : Number(formData.price),
            profile: formData.profile || undefined,
            cover: formData.cover || undefined,
            category: formData.category || undefined,
            capacity: formData.capacity ? Number(formData.capacity) : undefined,
        };

        try {
            if (mode === "edit") {
                await apiPatch(`/event/${eventId}`, body);
                toast.success("Event updated");
            } else {
                await apiPost("/post/event", body);
                toast.success("Event created");
            }
            if (onSuccess) onSuccess();
            else router.push("/admin/dashboard");
        } catch (error) {
            toast.error(error.message || "Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-card rounded-xl border border-border shadow-sm p-6 md:p-8">
            <h1 className="text-2xl font-bold mb-6">
                {mode === "edit" ? "Edit Event" : "Create an Event"}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="name">Title</Label>
                    <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="venue">Venue</Label>
                        <Input
                            id="venue"
                            name="venue"
                            value={formData.venue}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="organizer">Organizer</Label>
                        <Input
                            id="organizer"
                            name="organizer"
                            value={formData.organizer}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {mode === "create" ? (
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="datetime">Date and Time</Label>
                            <Input
                                id="datetime"
                                name="datetime"
                                type="datetime-local"
                                value={formData.datetime}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="date">Date</Label>
                                <Input
                                    id="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="time">Time</Label>
                                <Input
                                    id="time"
                                    name="time"
                                    value={formData.time}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </>
                    )}

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="category">Category</Label>
                        <Select
                            value={formData.category || undefined}
                            onValueChange={(value) =>
                                setFormData({ ...formData, category: value })
                            }
                        >
                            <SelectTrigger id="category">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                {EVENT_CATEGORIES.map((category) => (
                                    <SelectItem key={category} value={category}>
                                        {category}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="capacity">Capacity (optional)</Label>
                        <Input
                            id="capacity"
                            name="capacity"
                            type="number"
                            min="1"
                            placeholder="Unlimited"
                            value={formData.capacity}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="price">Price (₹)</Label>
                        <Input
                            id="price"
                            name="price"
                            type="number"
                            min="0"
                            max="3000"
                            value={isFree ? 0 : formData.price}
                            onChange={handleChange}
                            disabled={isFree}
                            required={!isFree}
                        />
                        <label className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <Checkbox
                                checked={isFree}
                                onCheckedChange={(checked) => setIsFree(!!checked)}
                            />
                            This is a free event
                        </label>
                    </div>

                    <ImageField
                        id="profile"
                        label="Profile Image"
                        value={formData.profile}
                        onChange={(value) => setFormData({ ...formData, profile: value })}
                    />
                    <ImageField
                        id="cover"
                        label="Cover Image"
                        value={formData.cover}
                        onChange={(value) => setFormData({ ...formData, cover: value })}
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        rows={5}
                        onChange={handleChange}
                        required
                    />
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                    {submitting
                        ? "Saving..."
                        : mode === "edit"
                        ? "Save Changes"
                        : "Create Event"}
                </Button>
            </form>
        </div>
    );
}

export default EventForm;
