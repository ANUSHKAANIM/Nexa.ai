// Server-side (getServerSideProps) helper: asks the API who, if anyone, the
// request's session cookie belongs to. Used only for the "already signed
// in, skip to the end of this form" UX redirect — the API still enforces
// real authorization on every actual request regardless of this check.
export async function getSession(context) {
    const cookie = context.req.headers.cookie;
    if (!cookie) return null;

    // Without a timeout, an unreachable/slow API hangs this SSR request
    // indefinitely instead of just falling back to "not signed in".
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
            headers: { cookie },
            signal: controller.signal,
        });
        if (!response.ok) return null;
        const body = await response.json();
        return body.data;
    } catch (error) {
        return null;
    } finally {
        clearTimeout(timeout);
    }
}
