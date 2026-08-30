import { useEffect, useRef } from "react";

const CONTAINER_ID = "qr-scanner-region";

// Thin wrapper around html5-qrcode's Html5QrcodeScanner, which renders its
// own camera-picker UI into the container div and owns its own start/stop
// lifecycle — we just forward decoded text up to the caller.
function QrScanner({ onScan }) {
    const scannerRef = useRef(null);

    useEffect(() => {
        let cancelled = false;

        import("html5-qrcode").then(({ Html5QrcodeScanner }) => {
            if (cancelled) return;
            const scanner = new Html5QrcodeScanner(
                CONTAINER_ID,
                { fps: 10, qrbox: 250 },
                false
            );
            scanner.render(
                (decodedText) => onScan(decodedText),
                () => {} // ignore per-frame decode failures — expected while aiming
            );
            scannerRef.current = scanner;
        });

        return () => {
            cancelled = true;
            scannerRef.current?.clear().catch(() => {});
        };
    }, [onScan]);

    return <div id={CONTAINER_ID} className="rounded-lg overflow-hidden" />;
}

export default QrScanner;
