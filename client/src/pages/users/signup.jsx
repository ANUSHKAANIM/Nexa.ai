import { apiGet, apiPost } from "@/utils/api";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import StepIndicator from "@/components/StepIndicator";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignUp() {
    const [step, setStep] = useState(1);
    const [message, setMessage] = useState({ errorMsg: "", successMsg: "" });
    const [submitting, setSubmitting] = useState(false);

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [contactNumber, setContactNumber] = useState("");
    const [regNumber, setRegNumber] = useState("");
    const [username, setUsername] = useState("");
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
            await apiPost("/user/signup", { email });
            setMessage({ errorMsg: "", successMsg: "Otp sent successfully!" });
            setStep(2);
        } catch (error) {
            setMessage({ errorMsg: error.message, successMsg: "" });
            if (error.status) {
                setTimeout(() => {
                    setMessage({ errorMsg: "Redirecting you to Sign In ...", successMsg: "" });
                }, 1700);
                setTimeout(() => router.push("/users/signin"), 2500);
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const regExp = /^[A-Za-z]{3}\d{7}$/;
        if (!regExp.test(regNumber)) {
            setMessage({ errorMsg: "Registration Number is not valid", successMsg: "" });
            return;
        }

        setSubmitting(true);
        try {
            await apiPost("/user/signup/verify", {
                contactNumber,
                otp,
                email,
                regNumber: regNumber.toUpperCase(),
                username,
            });
            setMessage({ errorMsg: "", successMsg: "Account creation successful!" });
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
                <h1 className="text-center text-2xl font-bold mb-8">Sign Up</h1>

                <StepIndicator steps={["Verify Email", "Complete Signup", "Done"]} current={step} />

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
                                <Label htmlFor="email">Email address</Label>
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
                                <Label htmlFor="email-disabled">Email address</Label>
                                <Input id="email-disabled" type="email" defaultValue={email} disabled />
                            </div>
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
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="username">Full Name</Label>
                                <Input
                                    id="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="regNumber">Registration Number</Label>
                                <Input
                                    id="regNumber"
                                    placeholder="e.g. ABC1234567"
                                    value={regNumber}
                                    onChange={(e) => setRegNumber(e.target.value)}
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    3 letters followed by 7 digits.
                                </p>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="contactNumber">Contact Number</Label>
                                <Input
                                    id="contactNumber"
                                    type="tel"
                                    value={contactNumber}
                                    onChange={(e) => setContactNumber(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? "Creating account..." : "Complete Signup"}
                            </Button>
                        </form>
                    )}

                    {step === 3 && (
                        <div className="flex flex-col gap-4">
                            <Alert variant="success">
                                <span className="font-bold">Success: </span>
                                Your account has been created!
                            </Alert>
                            <Button onClick={() => router.push("/users/dashboard")}>
                                Go to Dashboard
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
