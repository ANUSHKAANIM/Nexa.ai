import { apiPost } from "@/utils/api";
import { useRouter } from "next/router";
import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AcceptInvite() {
    const router = useRouter();
    const { token } = router.query;

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [status, setStatus] = useState({ error: "", success: "" });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setStatus({ error: "Passwords don't match", success: "" });
            return;
        }

        setSubmitting(true);
        try {
            await apiPost("/admin/accept-invite", { token, password });
            setStatus({ error: "", success: "Account activated! Redirecting..." });
            setTimeout(() => router.push("/admin/dashboard"), 1200);
        } catch (error) {
            setStatus({ error: error.message, success: "" });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="bg-card border border-border rounded-xl shadow-sm p-8 w-full max-w-sm">
                <h1 className="text-2xl font-bold mb-2">Welcome to NEXA</h1>
                <p className="text-muted-foreground mb-6">
                    Set a password to activate your admin account.
                </p>

                {!token ? (
                    <Alert variant="destructive">This invite link is missing its token.</Alert>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="password">New password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                minLength={8}
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="confirmPassword">Confirm password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                minLength={8}
                                required
                            />
                        </div>
                        {status.error && <Alert variant="destructive">{status.error}</Alert>}
                        {status.success && <Alert variant="success">{status.success}</Alert>}
                        <Button type="submit" disabled={submitting}>
                            {submitting ? "Activating..." : "Activate Account"}
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
}
