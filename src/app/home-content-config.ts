export interface HomeConfig {
    heroTag: string;
    heroTitle: string;
    heroSubtitle: string;
    emptyState?: {
        badge?: string;
        title?: string;
        description?: string;
        searchBadge?: string;
        searchDescription?: string;
    };
    features: Array<{
        title: string;
        description: string;
        colorType: "accent" | "primary" | "secondary";
    }>;
}
