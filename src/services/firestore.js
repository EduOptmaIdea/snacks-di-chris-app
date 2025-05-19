import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../firebase";
// Função para buscar todos os produtos do Firestore
export const fetchProductsFromFirestore = async () => {
    try {
        // Referência para a coleção 'products'
        const productsRef = collection(db, "products");
        // Criar uma consulta para buscar todos os documentos
        const q = query(productsRef);
        // Executar a consulta
        const querySnapshot = await getDocs(q);
        // Mapear os documentos para o formato SnackItem
        const snacks = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            // Mapear os campos do Firestore para o formato esperado pelo front-end
            return {
                id: doc.id,
                productname: data.productName || "",
                name: data.productName || "",
                description: data.description || "",
                price: data.price || 0,
                image: data.image || "",
                imagePath: data.imagePath || "",
                category: data.categoryRef || "",
                categoria: data.categoryRef || "",
                available: data.available !== undefined ? data.available : true,
                ingredients: data.ingredientRefs || [],
                ingredientes: data.ingredientRefs || [],
                "allergenic-agents": data.allergenicAgentRefs || [],
                alergenicos: data.allergenicAgentRefs || [], // Adicionado para compatibilidade
            };
        });
        return snacks;
    }
    catch (error) {
        console.error("Erro ao buscar produtos do Firestore:", error);
        return [];
    }
};
