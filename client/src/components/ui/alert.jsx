import { cn } from "@/lib/utils";

const variants = {
    default: "bg-muted text-foreground",
    destructive: "bg-destructive/10 text-destructive",
    success: "bg-success/10 text-success",
};

function Alert({ variant = "default", className, ...props }) {
    return (
        <div
            role="alert"
            className={cn("rounded-lg p-3 text-sm font-medium", variants[variant], className)}
            {...props}
        />
    );
}

export { Alert };
