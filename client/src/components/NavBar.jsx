import { apiGet } from "@/utils/api";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import ProfileDropdown from "@/components/ProfileDropdown";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

const ROLE_CONFIG = {
    user: {
        detailsPath: "/user/details",
        homePath: "/users/dashboard",
        signInPath: "/users/signin",
        links: [
            { label: "Dashboard", href: "/users/dashboard" },
            { label: "Past Events", href: "/users/past_events" },
            { label: "About us", href: "/" },
        ],
        profileLabel: "Profile",
        profileRows: (data) => [
            { label: "Full Name", value: data.username },
            { label: "Email", value: data.email },
            { label: "Registration No.", value: data.reg_number },
        ],
        showChangePassword: false,
    },
    admin: {
        detailsPath: "/admin/details",
        homePath: "/admin/dashboard",
        signInPath: "/admin/auth",
        links: (data) => [
            { label: "Dashboard", href: "/admin/dashboard" },
            ...(data.role === "superadmin"
                ? [{ label: "Manage Admins", href: "/admin/manage-admins" }]
                : []),
            { label: "About us", href: "/" },
        ],
        profileLabel: "Admin",
        profileRows: (data) => [
            { label: "Full Name", value: data.name },
            { label: "Email", value: data.email },
            { label: "Role", value: data.role },
        ],
        showChangePassword: true,
    },
};

// Single nav bar shared by both the user and admin experience — previously
// two near-identical components each duplicating the fetch/redirect logic.
function NavBar({ role }) {
    const router = useRouter();
    const config = ROLE_CONFIG[role];
    const [data, setData] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await apiGet(config.detailsPath);
                setData(result);
            } catch (error) {
                console.error(`Failed to fetch ${role} data:`, error.message);
                router.push(config.signInPath);
            }
        };
        fetchData();
    }, [role]);

    const links = typeof config.links === "function" ? config.links(data || {}) : config.links;

    return (
        <div className="mb-[8vh]">
            <header className="bg-background fixed top-0 z-40 w-full shadow-sm border-b border-border">
                <div className="container mx-auto flex items-center justify-between h-16">
                    <div
                        onClick={() => router.push(config.homePath)}
                        className="flex items-center cursor-pointer"
                    >
                        <h1 className="text-foreground font-bold text-3xl">
                            {"<"}
                            <span className="text-primary">NEXA</span>
                            {" />"}
                        </h1>
                    </div>

                    {/* Desktop nav */}
                    <nav className="hidden md:flex items-center gap-6 text-sm">
                        {links.map((link) => (
                            <a
                                key={link.href}
                                onClick={() => router.push(link.href)}
                                className="cursor-pointer text-foreground/80 hover:text-primary transition-colors"
                            >
                                {link.label}
                            </a>
                        ))}
                        <ThemeToggle />
                        {data && (
                            <ProfileDropdown
                                label={config.profileLabel}
                                rows={config.profileRows(data)}
                                showChangePassword={config.showChangePassword}
                            />
                        )}
                    </nav>

                    {/* Mobile nav */}
                    <div className="md:hidden">
                        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right">
                                <SheetTitle>Menu</SheetTitle>
                                <div className="flex flex-col gap-4 mt-6">
                                    {links.map((link) => (
                                        <a
                                            key={link.href}
                                            onClick={() => {
                                                setMobileOpen(false);
                                                router.push(link.href);
                                            }}
                                            className="cursor-pointer text-base"
                                        >
                                            {link.label}
                                        </a>
                                    ))}
                                    <div className="flex items-center justify-between pt-4 border-t border-border">
                                        <span className="text-sm text-muted-foreground">Theme</span>
                                        <ThemeToggle />
                                    </div>
                                    {data && (
                                        <div className="pt-4 border-t border-border">
                                            <ProfileDropdown
                                                label={config.profileLabel}
                                                rows={config.profileRows(data)}
                                                showChangePassword={config.showChangePassword}
                                            />
                                        </div>
                                    )}
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </header>
        </div>
    );
}

export default NavBar;
