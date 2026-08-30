// Central fetch wrapper: every request carries the httpOnly session cookie
// (`credentials: "include"`) and every response is unwrapped from the
// server's `{ success, data, message }` envelope. Throws an Error (with the
// server's message) on failure so callers can just try/catch once.
export async function apiFetch(path, options = {}) {
    // Without a timeout, a slow/unreachable API leaves the caller (and any
    // button `disabled={submitting}` state driven by it) hanging forever.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    let response;
    try {
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
            credentials: "include",
            signal: controller.signal,
            headers: options.body
                ? { "Content-Type": "application/json", ...options.headers }
                : options.headers,
            ...options,
        });
    } catch (error) {
        throw new Error(
            error.name === "AbortError"
                ? "The request timed out. Please try again."
                : "Network error. Please check your connection and try again."
        );
    } finally {
        clearTimeout(timeout);
    }

    const body = await response.json().catch(() => null);

    if (!response.ok || !body?.success) {
        const message = body?.message || `Request failed (${response.status})`;
        const error = new Error(message);
        error.status = response.status;
        error.data = body?.data;
        throw error;
    }

    return body.data;
}

export const apiGet = (path) => apiFetch(path);
export const apiPost = (path, data) =>
    apiFetch(path, { method: "POST", body: JSON.stringify(data ?? {}) });
export const apiPatch = (path, data) =>
    apiFetch(path, { method: "PATCH", body: JSON.stringify(data ?? {}) });

// FormData must NOT get a manual Content-Type — the browser sets its own
// multipart boundary. apiFetch always forces application/json when a body
// is present, so file uploads go through fetch directly instead.
export async function apiUpload(path, file) {
    const formData = new FormData();
    formData.append("image", file);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    let response;
    try {
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
            method: "POST",
            credentials: "include",
            body: formData,
            signal: controller.signal,
        });
    } catch (error) {
        throw new Error(
            error.name === "AbortError"
                ? "The upload timed out. Please try again."
                : "Network error. Please check your connection and try again."
        );
    } finally {
        clearTimeout(timeout);
    }

    const body = await response.json().catch(() => null);
    if (!response.ok || !body?.success) {
        throw new Error(body?.message || `Upload failed (${response.status})`);
    }
    return body.data;
}
