import { getBrandConfig } from "@/lib/brand-config";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
    const config = getBrandConfig();
    const { contact } = config.content;

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto text-center">
                <h1 className="text-4xl font-bold mb-4">{contact.title}</h1>
                <p className="text-muted-foreground mb-12">{contact.subtitle}</p>

                <form className="space-y-6 text-left border p-8 rounded-[var(--radius)] bg-card shadow-sm">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">First Name</label>
                            <input className="w-full h-10 px-3 rounded-md border bg-background" placeholder="First Name" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Last Name</label>
                            <input className="w-full h-10 px-3 rounded-md border bg-background" placeholder="Last Name" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <input className="w-full h-10 px-3 rounded-md border bg-background" placeholder="hello@example.com" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Message</label>
                        <textarea className="w-full min-h-[120px] p-3 rounded-md border bg-background" placeholder="How can we help?" />
                    </div>
                    <Button className="w-full py-6">Send Message</Button>
                </form>

                <div className="mt-12 grid grid-cols-2 gap-8 text-sm">
                    <div>
                        <h3 className="font-bold mb-2">Location</h3>
                        <p className="text-muted-foreground">{contact.location}</p>
                    </div>
                    <div>
                        <h3 className="font-bold mb-2">Hours</h3>
                        <p className="text-muted-foreground">Mon - Fri: {contact.hours.week}<br />Sat - Sun: {contact.hours.weekend}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
