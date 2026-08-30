import PageShell from "@/components/PageShell";
import EventForm from "@/components/EventForm";
import Image from "next/image";

function EventFormPage() {
    return (
        <PageShell role="admin">
            <div className="container mx-auto px-4 pb-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div className="hidden md:block relative h-[32rem] rounded-xl overflow-hidden">
                        <Image
                            src="/img/eventsFormImg.jpg"
                            alt=""
                            fill
                            className="object-cover"
                        />
                    </div>
                    <EventForm mode="create" />
                </div>
            </div>
        </PageShell>
    );
}

export default EventFormPage;
