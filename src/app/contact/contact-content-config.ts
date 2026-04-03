export interface ContactConfig {
    title: string;
    subtitle: string;
    location: string;
    hours: {
        week: string;
        weekend: string;
    };
    /** Inbox for the contact form (mailto). */
    email?: string;
    /** Shown as a clickable tel: link when set. */
    phone?: string;
}
