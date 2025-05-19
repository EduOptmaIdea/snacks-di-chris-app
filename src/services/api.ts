import { fetchProductsFromFirestore } from "./firestore";
import { SnackItem } from "../types/snacks";

// Função para buscar snacks do Firestore
export const fetchSnacks = async (): Promise<SnackItem[]> => {
  try {
    // Buscar produtos do Firestore usando o novo serviço
    const snacks = await fetchProductsFromFirestore();
    return snacks;
  } catch (error) {
    console.error("Erro ao buscar snacks:", error);
    return [];
  }
};
