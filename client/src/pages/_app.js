import "@/styles/globals.css";
import "@/styles/Home.css";
import Head from "next/head";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";

export default function App({ Component, pageProps }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <Head>
                <link rel="shortcut icon" href="/favicon_io/favicon.ico" />
                <title>NEXA</title>
            </Head>
            <Component {...pageProps} />
            <Toaster position="top-center" />
        </ThemeProvider>
    );
}
