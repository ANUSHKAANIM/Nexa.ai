import Head from "next/head";
import LandingPage from "@/components/LandingPage";

export default function Home() {
    return (
        <div>
            <Head>
                <meta
                    name="description"
                    content="NEXA is an event-management platform for organizing events, taking registrations, and selling tickets — sign in with a one-time email code and book tickets in a few clicks."
                />
            </Head>
            <LandingPage />
        </div>
    );
}
