import PageShell from "@/components/PageShell";
import QrScanner from "@/components/QrScanner";
import { apiPost } from "@/utils/api";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { Search, ScanLine } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Registration = () => {
    const router = useRouter();
    const eventId = router.query.eventId;
    const [showChecklist, setShowChecklist] = useState(false);
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [scannerOpen, setScannerOpen] = useState(false);
    const lastScanRef = useRef({ token: "", time: 0 });

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const data = await apiPost("/getevent", { event_id: eventId });
                setUsers(data.participants || []);
            } catch (error) {
                console.error("Error fetching event data:", error.message);
            }
        };

        if (eventId) {
            fetchEvent();
        }
    }, [eventId]);

    function handleCheckboxChange(userId) {
        setUsers(
            users.map((user) =>
                user.id === userId ? { ...user, checked: !user.checked } : user
            )
        );
    }

    const handleSubmit = async () => {
        const checkedUsers = users.filter((user) => user.checked).map((user) => user.id);
        if (checkedUsers.length === 0) return;

        setSubmitting(true);
        try {
            await apiPost("/event/checkin", {
                event_id: eventId,
                checkInList: checkedUsers,
            });
            toast.success(`Checked in ${checkedUsers.length} attendee(s)`);
            router.reload();
        } catch (error) {
            toast.error(error.message || "Failed to check in attendees.");
            setSubmitting(false);
        }
    };

    // Debounced against the html5-qrcode scanner firing repeatedly on the
    // same still-visible code before the attendee moves their phone away.
    const handleScan = useCallback(
        async (token) => {
            const now = Date.now();
            if (token === lastScanRef.current.token && now - lastScanRef.current.time < 3000) {
                return;
            }
            lastScanRef.current = { token, time: now };

            try {
                const result = await apiPost("/event/checkin/scan", { token });
                if (result.alreadyCheckedIn) {
                    toast.info(`${result.name} was already checked in`);
                } else {
                    toast.success(`Checked in ${result.name}`);
                    setUsers((prev) =>
                        prev.map((u) => (u.id === result.id ? { ...u, entry: true } : u))
                    );
                }
            } catch (error) {
                toast.error(error.message || "That QR code isn't valid for this event.");
            }
        },
        []
    );

    const visibleUsers = users
        .filter((user) => user.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .filter((user) => !showChecklist || !user.entry);

    const checkedCount = users.filter((u) => u.checked).length;

    return (
        <PageShell role="admin" stickyFooter>
            <div className="container mx-auto px-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
                    <div className="flex gap-2">
                        <Button
                            variant={showChecklist ? "outline" : "default"}
                            onClick={() => setShowChecklist(false)}
                        >
                            All Users ({users.length})
                        </Button>
                        <Button
                            variant={showChecklist ? "default" : "outline"}
                            onClick={() => setShowChecklist(true)}
                        >
                            Check-In List
                        </Button>
                        <Button variant="outline" onClick={() => setScannerOpen(true)} className="gap-2">
                            <ScanLine className="h-4 w-4" />
                            Scan to Check In
                        </Button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 w-full sm:w-64"
                        />
                    </div>
                </div>

                {visibleUsers.length === 0 ? (
                    <EmptyState
                        title={showChecklist ? "Everyone's checked in" : "No registrants found"}
                        description={
                            showChecklist
                                ? "No pending attendees match your search."
                                : "No one matches your search yet."
                        }
                    />
                ) : (
                    <>
                        {/* Desktop table */}
                        <div className="hidden md:block overflow-x-auto rounded-xl border border-border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted text-muted-foreground">
                                    <tr>
                                        <th className="p-3 text-left">#</th>
                                        <th className="p-3 text-left">Name</th>
                                        <th className="p-3 text-left">Email</th>
                                        <th className="p-3 text-left">Reg. No.</th>
                                        {showChecklist && <th className="p-3 text-left">Check in</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {visibleUsers.map((user, index) => (
                                        <tr
                                            key={user.id}
                                            className={`border-t border-border ${
                                                user.checked ? "bg-primary/10" : ""
                                            }`}
                                        >
                                            <td className="p-3">{index + 1}</td>
                                            <td className="p-3">{user.name}</td>
                                            <td className="p-3">{user.email}</td>
                                            <td className="p-3">{user.regno}</td>
                                            {showChecklist && (
                                                <td className="p-3">
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <Checkbox
                                                            checked={!!user.checked}
                                                            onCheckedChange={() =>
                                                                handleCheckboxChange(user.id)
                                                            }
                                                        />
                                                        <span className="text-xs text-muted-foreground font-mono">
                                                            {user.passID}
                                                        </span>
                                                    </label>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile card list — a wide table is unusable at a check-in
                            desk on a phone, so this gets tappable cards instead */}
                        <div className="md:hidden flex flex-col gap-3">
                            {visibleUsers.map((user) => (
                                <label
                                    key={user.id}
                                    onClick={() => showChecklist && handleCheckboxChange(user.id)}
                                    className={`flex items-center gap-3 rounded-xl border border-border bg-card p-4 ${
                                        showChecklist ? "cursor-pointer" : ""
                                    } ${user.checked ? "border-primary bg-primary/10" : ""}`}
                                >
                                    {showChecklist && (
                                        <Checkbox checked={!!user.checked} className="h-6 w-6 shrink-0" />
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium truncate">{user.name}</p>
                                        <p className="text-sm text-muted-foreground truncate">
                                            {user.email}
                                        </p>
                                        <p className="text-xs text-muted-foreground font-mono mt-1">
                                            {user.regno} · {user.passID}
                                        </p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {showChecklist && checkedCount > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 flex justify-center z-30">
                    <Button onClick={handleSubmit} disabled={submitting} size="lg" className="w-full max-w-sm">
                        {submitting ? "Checking in..." : `Check in ${checkedCount} attendee(s)`}
                    </Button>
                </div>
            )}

            <Dialog open={scannerOpen} onOpenChange={setScannerOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Scan Ticket QR</DialogTitle>
                    </DialogHeader>
                    {scannerOpen && <QrScanner onScan={handleScan} />}
                </DialogContent>
            </Dialog>
        </PageShell>
    );
};

export default Registration;
