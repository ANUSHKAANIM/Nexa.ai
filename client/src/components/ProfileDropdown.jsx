import { useState } from "react";
import { useRouter } from "next/router";
import { ChevronDown, KeyRound, LogOut } from "lucide-react";
import { toast } from "sonner";
import { apiPost } from "@/utils/api";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

// Shared profile menu for both the user and admin nav bars — previously two
// near-identical hand-rolled dropdowns each with their own click-outside
// detection logic; Radix's DropdownMenu handles that for free.
// showChangePassword is admin-only — users authenticate via OTP and never
// have a password to change.
function ProfileDropdown({ label, rows, showChangePassword = false }) {
    const router = useRouter();
    const [showPasswordDialog, setShowPasswordDialog] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleLogout = async () => {
        try {
            await apiPost("/logout");
        } catch (error) {
            console.error("Logout failed:", error.message);
        }
        router.push("/");
    };

    const resetPasswordForm = () => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error("New passwords don't match");
            return;
        }
        setSubmitting(true);
        try {
            await apiPost("/admin/change-password", { currentPassword, newPassword });
            toast.success("Password updated");
            resetPasswordForm();
            setShowPasswordDialog(false);
        } catch (error) {
            toast.error(error.message || "Failed to update password.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button size="sm" className="gap-1.5">
                        {label}
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                    {rows.map(({ label: rowLabel, value }) => (
                        <DropdownMenuLabel key={rowLabel} className="font-normal">
                            <p className="text-xs text-muted-foreground">{rowLabel}</p>
                            <p className="text-sm truncate">{value}</p>
                        </DropdownMenuLabel>
                    ))}
                    <DropdownMenuSeparator />
                    {showChangePassword && (
                        <DropdownMenuItem
                            onClick={() => setShowPasswordDialog(true)}
                            className="gap-2"
                        >
                            <KeyRound className="h-4 w-4" />
                            Change Password
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={handleLogout} className="gap-2 text-destructive">
                        <LogOut className="h-4 w-4" />
                        Logout
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog
                open={showPasswordDialog}
                onOpenChange={(open) => {
                    setShowPasswordDialog(open);
                    if (!open) resetPasswordForm();
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="currentPassword">Current password</Label>
                            <Input
                                id="currentPassword"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="newPassword">New password</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                minLength={8}
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="confirmPassword">Confirm new password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                minLength={8}
                                required
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? "Saving..." : "Update Password"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default ProfileDropdown;
