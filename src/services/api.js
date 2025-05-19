import { fetchProductsFromFirestore } from "./firestore";
// Função para buscar snacks do Firestore
export const fetchSnacks = async () => {
    try {
        // Buscar produtos do Firestore usando o novo serviço
        const snacks = await fetchProductsFromFirestore();
        return snacks;
    }
    catch (error) {
        console.error("Erro ao buscar snacks:", error);
        return [];
    }
};
