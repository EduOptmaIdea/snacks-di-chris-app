export interface ProductData {
  id: string;
  productname?: string;
  categoryRef?: string;
  price?: number;
  currentStock?: number;
  available?: boolean;
  descontinued?: boolean;
}

export type SortField = 'productname' | 'category' | 'price' | 'currentStock' | 'status' | 'available';