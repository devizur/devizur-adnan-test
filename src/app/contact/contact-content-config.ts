export interface ContactConfig {
    title: string;
    subtitle: string;
    location: string;
    hours: {
        week: string;
        weekend: string;
    };
}
