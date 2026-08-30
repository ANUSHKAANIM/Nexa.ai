import { cn } from "@/lib/utils";

function EmptyState({ icon: Icon, title, description, action, className }) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 py-16 px-6 text-center",
                className
            )}
        >
            {Icon && <Icon className="h-10 w-10 text-muted-foreground mb-2" />}
            <p className="font-medium text-foreground">{title}</p>
            {description && (
                <p className="text-sm text-muted-foreground max-w-sm">
                    {description}
                </p>
            )}
            {action && <div className="mt-2">{action}</div>}
        </div>
    );
}

export { EmptyState };
