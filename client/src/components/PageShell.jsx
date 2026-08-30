import NavBar from "@/components/NavBar";

// Shared page wrapper for every authenticated page — previously each page
// hand-duplicated this exact shell (padding to clear NavBar's fixed header,
// background, min-height) alongside its own <NavBar> invocation.
function PageShell({ role, className = "", stickyFooter = false, children }) {
    return (
        <div
            className={`pt-20 lg:pt-8 bg-background min-h-screen ${
                stickyFooter ? "pb-24" : ""
            } ${className}`}
        >
            <NavBar role={role} />
            {children}
        </div>
    );
}

export default PageShell;
