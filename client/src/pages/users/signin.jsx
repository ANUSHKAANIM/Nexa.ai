import { apiGet, apiPost } from "@/utils/api";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import StepIndicator from "@/components/StepIndicator";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignIn() {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState(1);
    const [message, setMessage] = useState({ errorMsg: "", successMsg: "" });
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

    // Checked client-side (not via getServerSideProps) since the client and
    // API can be deployed to separate domains, where the session cookie
    // never reaches the client's own server-rendering request.
    useEffect(() => {
        apiGet("/user/details")
            .then(() => {
                setStep(3);
                setMessage({ errorMsg: "", successMsg: "Redirecting you ..." });
                setTimeout(() => router.push("/users/dashboard"), 800);
            })
            .catch(() => {});
    }, []);

    const handleVerifyEmail = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        try {
            const data = await apiPost("/user/signin", { email });
            setMessage({ errorMsg: "", successMsg: data?.message || "Otp sent successfully!" });
            setStep(2);
        } catch (error) {
            setMessage({ errorMsg: error.message, successMsg: "" });
            if (error.status) {
                setTimeout(() => {
                    setMessage({ errorMsg: "Redirecting you to Sign Up ...", successMsg: "" });
                }, 1700);
                setTimeout(() => router.push("/users/signup"), 2500);
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        try {
            await apiPost("/user/signin/verify", { email, otp });
            setMessage({ errorMsg: "", successMsg: "Sign-In successful!" });
            setStep(3);
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
                <h1 className="text-center text-2xl font-bold mb-8">Sign In</h1>

                <StepIndicator steps={["Verify Email", "OTP Verification", "Done"]} current={step} />

                {message.errorMsg && (
                    <Alert variant="destructive" className="mt-4">{message.errorMsg}</Alert>
                )}
                {message.successMsg && (
                    <Alert variant="success" className="mt-4">{message.successMsg}</Alert>
                )}

                <div className="bg-card border border-border rounded-xl shadow-sm p-6 mt-4">
                    {step === 1 && (
                        <form onSubmit={handleVerifyEmail} className="flex flex-col gap-4">
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
                            <Button type="submit" disabled={submitting}>
                                {submitting ? "Sending..." : "Verify"}
                            </Button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="otp">Verification Code</Label>
                                <Input
                                    id="otp"
                                    autoComplete="one-time-code"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? "Verifying..." : "Submit"}
                            </Button>
                        </form>
                    )}

                    {step === 3 && (
                        <div className="flex flex-col gap-4">
                            <Alert variant="success">
                                <span className="font-bold">Hey there! </span>
                                Welcome back, you&apos;re successfully signed in!
                            </Alert>
                            <Button onClick={() => router.push("/users/dashboard")}>
                                Go to your dashboard
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
