import { ProductItem } from "@/components/ui/reused/ActivitiesCard";

export interface Activity extends ProductItem {
    id: number;
    category: string;
}

export interface Food extends ProductItem {
    id: number;
    category: string;
}

export interface Package extends ProductItem {
    id: number;
    category: string;
}
