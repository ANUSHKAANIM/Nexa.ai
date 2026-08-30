import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

// resolvedTheme is unknown on the server, so we render a disabled placeholder
// until mounted to avoid a hydration mismatch between server/client icons.
function ThemeToggle({ className }) {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) {
        return <Button variant="ghost" size="icon" className={className} disabled aria-hidden="true" />;
    }

    const isDark = resolvedTheme === "dark";
    return (
        <Button
            variant="ghost"
            size="icon"
            className={className}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            onClick={() => setTheme(isDark ? "light" : "dark")}
        >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
    );
}

export default ThemeToggle;
