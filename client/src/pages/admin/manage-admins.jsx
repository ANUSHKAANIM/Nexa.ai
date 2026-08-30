import PageShell from "@/components/PageShell";
import { apiGet, apiPost, apiPatch } from "@/utils/api";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert } from "@/components/ui/alert";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

// Role guard runs client-side (not via getServerSideProps) because the
// client and API can be deployed to separate domains, where the session
// cookie never reaches the client's own server-rendering request — see
// NavBar for the same pattern. The real authorization is enforced by
// /admin/list itself regardless; this only controls the redirect UX.
export default function ManageAdmins() {
    const router = useRouter();
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showInvite, setShowInvite] = useState(false);
    const [inviteForm, setInviteForm] = useState({ name: "", email: "" });
    const [inviting, setInviting] = useState(false);

    useEffect(() => {
        apiGet("/admin/details")
            .then((data) => {
                if (data.role !== "superadmin") router.push("/admin/dashboard");
            })
            .catch(() => router.push("/admin/auth"));
    }, []);

    const fetchAdmins = async () => {
        try {
            const data = await apiGet("/admin/list");
            setAdmins(data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    const handleInvite = async (e) => {
        e.preventDefault();
        setInviting(true);
        try {
            await apiPost("/admin/invite", inviteForm);
            toast.success(`Invite sent to ${inviteForm.email}`);
            setInviteForm({ name: "", email: "" });
            setShowInvite(false);
            fetchAdmins();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setInviting(false);
        }
    };

    const toggleStatus = async (adminId) => {
        try {
            await apiPatch(`/admin/${adminId}/status`);
            fetchAdmins();
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <PageShell role="admin">
            <div className="container mx-auto px-4 pb-16">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">Manage Admins</h1>
                    <Button onClick={() => setShowInvite(true)} className="gap-2">
                        <UserPlus className="h-4 w-4" />
                        Invite Admin
                    </Button>
                </div>

                {error && <Alert variant="destructive" className="mb-4">{error}</Alert>}

                {loading ? (
                    <Skeleton className="h-64 w-full rounded-xl" />
                ) : (
                    <>
                        {/* Desktop table */}
                        <div className="hidden md:block overflow-x-auto rounded-xl border border-border">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3">Name</th>
                                        <th className="px-4 py-3">Email</th>
                                        <th className="px-4 py-3">Role</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Events</th>
                                        <th className="px-4 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {admins.map((admin) => (
                                        <tr key={admin.admin_id} className="border-t border-border">
                                            <td className="px-4 py-3">{admin.name}</td>
                                            <td className="px-4 py-3">{admin.email}</td>
                                            <td className="px-4 py-3 capitalize">{admin.role}</td>
                                            <td className="px-4 py-3">
                                                <Badge variant={admin.active ? "success" : "outline"}>
                                                    {admin.active ? admin.status : "Deactivated"}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">{admin.eventCount}</td>
                                            <td className="px-4 py-3 text-right">
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                    onClick={() => toggleStatus(admin.admin_id)}
                                                >
                                                    {admin.active ? "Deactivate" : "Reactivate"}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile card list — mirrors registration.jsx's table+card pattern */}
                        <div className="md:hidden flex flex-col gap-3">
                            {admins.map((admin) => (
                                <div key={admin.admin_id} className="rounded-xl border border-border bg-card p-4">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="font-medium truncate">{admin.name}</p>
                                        <Badge variant={admin.active ? "success" : "outline"}>
                                            {admin.active ? admin.status : "Deactivated"}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground truncate">{admin.email}</p>
                                    <p className="text-xs text-muted-foreground capitalize mt-1">
                                        {admin.role} · {admin.eventCount} event{admin.eventCount === 1 ? "" : "s"}
                                    </p>
                                    <Button
                                        variant="link"
                                        size="sm"
                                        className="px-0 mt-1"
                                        onClick={() => toggleStatus(admin.admin_id)}
                                    >
                                        {admin.active ? "Deactivate" : "Reactivate"}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <Dialog open={showInvite} onOpenChange={setShowInvite}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Invite Admin</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleInvite} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="invite-name">Name</Label>
                            <Input
                                id="invite-name"
                                value={inviteForm.name}
                                onChange={(e) =>
                                    setInviteForm({ ...inviteForm, name: e.target.value })
                                }
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="invite-email">Email</Label>
                            <Input
                                id="invite-email"
                                type="email"
                                value={inviteForm.email}
                                onChange={(e) =>
                                    setInviteForm({ ...inviteForm, email: e.target.value })
                                }
                                required
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowInvite(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={inviting}>
                                {inviting ? "Sending..." : "Send Invite"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </PageShell>
    );
}
