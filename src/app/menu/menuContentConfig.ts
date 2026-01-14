export interface MenuConfig {
  title: string;
  subtitle: string;
  categories: Array<{
    name: string;
    items: Array<{
      name: string;
      description: string;
      price: string;
    }>;
  }>;
}
