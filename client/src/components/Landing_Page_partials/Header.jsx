import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";

function Header() {
    const router = useRouter();

    return (
        <header className="absolute w-full z-30">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-20">
                    <nav className="flex grow">
                        <ul className="flex grow justify-end flex-wrap items-center gap-3">
                            <li>
                                <ThemeToggle />
                            </li>
                            <li>
                                <Button
                                    variant="ghost"
                                    onClick={() => router.push("/users/signin")}
                                >
                                    Sign in
                                </Button>
                            </li>
                            <li>
                                <Button onClick={() => router.push("/admin/auth")}>
                                    Manage
                                </Button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </header>
    );
}

export default Header;
