export interface SnackItem {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
  }
  
  export type SnacksResponse = {
    snacks: SnackItem[];
  };