import { cn } from "@/lib/utils";

// Shared by every multi-step auth flow (user sign-in, sign-up, admin auth) —
// previously each page hand-rolled its own copy of this exact markup.
function StepIndicator({ steps, current }) {
    return (
        <div className="flex items-center">
            {steps.map((label, i) => {
                const step = i + 1;
                const active = step <= current;
                return (
                    <div key={label} className="flex-1">
                        <div
                            className={cn(
                                "h-full border-2 px-4 py-2 text-sm",
                                i === 0 && "rounded-l-lg",
                                i === steps.length - 1 && "rounded-r-lg",
                                i > 0 && "border-l-0",
                                active
                                    ? "text-primary-foreground bg-primary border-primary"
                                    : "border-primary/30 border-dashed text-muted-foreground"
                            )}
                        >
                            <div className="font-semibold">
                                {String(step).padStart(2, "0")}
                            </div>
                            {label}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default StepIndicator;
