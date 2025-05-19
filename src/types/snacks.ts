export interface SnackItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  available: boolean;
}

export type SnacksResponse = {
  snacks: SnackItem[];
};
