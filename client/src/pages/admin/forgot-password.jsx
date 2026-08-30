import { apiPost } from "@/utils/api";
import { useRouter } from "next/router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import StepIndicator from "@/components/StepIndicator";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminForgotPassword() {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [step, setStep] = useState(1);
    const [message, setMessage] = useState({ errorMsg: "", successMsg: "" });
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

    const handleRequestOtp = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setMessage({ errorMsg: "", successMsg: "" });
        try {
            await apiPost("/admin/forgot-password", { email });
            setMessage({
                errorMsg: "",
                successMsg: "If that email is registered, a reset code has been sent.",
            });
            setStep(2);
        } catch (error) {
            setMessage({ errorMsg: error.message, successMsg: "" });
        } finally {
            setSubmitting(false);
        }
    };

    const handleResetPassword = async (event) => {
        event.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage({ errorMsg: "New passwords don't match", successMsg: "" });
            return;
        }
        setSubmitting(true);
        setMessage({ errorMsg: "", successMsg: "" });
        try {
            await apiPost("/admin/reset-password", { email, otp, newPassword });
            setMessage({ errorMsg: "", successMsg: "Password reset — redirecting you to sign in..." });
            setStep(3);
            setTimeout(() => router.push("/admin/auth"), 1200);
        } catch (error) {
            setMessage({ errorMsg: error.message, successMsg: "" });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background p-4">
            <button onClick={() => router.push("/admin/auth")} className="mb-4">
                <ArrowLeft className="h-6 w-6" />
            </button>

            <div className="max-w-md mx-auto mt-6">
                <h1 className="text-center text-2xl font-bold mb-8">
                    Reset Admin Password
                </h1>

                <StepIndicator steps={["Request Code", "Reset Password", "Done"]} current={step} />

                {message.errorMsg && (
                    <Alert variant="destructive" className="mt-4">{message.errorMsg}</Alert>
                )}
                {message.successMsg && (
                    <Alert variant="success" className="mt-4">{message.successMsg}</Alert>
                )}

                <div className="bg-card border border-border rounded-xl shadow-sm p-6 mt-4">
                    {step === 1 && (
                        <form onSubmit={handleRequestOtp} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="email">Registered Admin Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? "Sending..." : "Send Reset Code"}
                            </Button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="otp">6-Digit Code</Label>
                                <Input
                                    id="otp"
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="newPassword">New Password</Label>
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
                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    minLength={8}
                                    required
                                />
                            </div>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? "Resetting..." : "Reset Password"}
                            </Button>
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="text-sm text-muted-foreground hover:text-primary"
                            >
                                Didn&apos;t get a code? Try again
                            </button>
                        </form>
                    )}

                    {step === 3 && (
                        <Alert variant="success">
                            <span className="font-bold">All set! </span>
                            Your password has been reset.
                        </Alert>
                    )}
                </div>
            </div>
        </div>
    );
}
