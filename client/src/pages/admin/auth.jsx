import { apiGet, apiPost } from "@/utils/api";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import StepIndicator from "@/components/StepIndicator";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminAuth() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [step, setStep] = useState(1);
    const [message, setMessage] = useState({ errorMsg: "", successMsg: "" });
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

    // Checked client-side (not via getServerSideProps) since the client and
    // API can be deployed to separate domains, where the session cookie
    // never reaches the client's own server-rendering request.
    useEffect(() => {
        apiGet("/admin/details")
            .then(() => {
                setStep(2);
                setMessage({ errorMsg: "", successMsg: "Redirecting you ..." });
                setTimeout(() => router.push("/admin/dashboard"), 800);
            })
            .catch(() => {});
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        try {
            await apiPost("/admin/auth", { email, password });
            setMessage({ errorMsg: "", successMsg: "Success" });
            setStep(2);
        } catch (error) {
            setMessage({ errorMsg: error.message, successMsg: "" });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background p-4">
            <button onClick={() => router.push("/")} className="mb-4">
                <ArrowLeft className="h-6 w-6" />
            </button>

            <div className="max-w-md mx-auto mt-6">
                <h1 className="text-center text-2xl font-bold mb-8">
                    Admin Authentication
                </h1>

                <StepIndicator steps={["Verify Credentials", "Done"]} current={step} />

                {message.errorMsg && (
                    <Alert variant="destructive" className="mt-4">{message.errorMsg}</Alert>
                )}
                {message.successMsg && (
                    <Alert variant="success" className="mt-4">{message.successMsg}</Alert>
                )}

                <div className="bg-card border border-border rounded-xl shadow-sm p-6 mt-4">
                    {step === 1 && (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="email">Registered Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? "Verifying..." : "Verify"}
                            </Button>
                            <button
                                type="button"
                                onClick={() => router.push("/admin/forgot-password")}
                                className="text-sm text-muted-foreground hover:text-primary self-center"
                            >
                                Forgot password?
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <div className="flex flex-col gap-4">
                            <Alert variant="success">
                                <span className="font-bold">Hey there! </span>
                                Welcome back, you&apos;re successfully signed in!
                            </Alert>
                            <Button onClick={() => router.push("/admin/dashboard")}>
                                Go to your dashboard
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
