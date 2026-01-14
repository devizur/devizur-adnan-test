export interface HomeConfig {
    heroTag: string;
    heroTitle: string;
    heroSubtitle: string;
    features: Array<{
        title: string;
        description: string;
        colorType: "accent" | "primary" | "secondary";
    }>;
}
