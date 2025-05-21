// firestore-references.js
// Serviço para buscar e resolver referências de ingredientes e alergênicos

import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase.ts';

// Mapas para armazenar as referências
let ingredientsMap = {};
let allergenicAgentsMap = {};
let isInitialized = false;

/**
 * Inicializa os mapas de referência buscando todos os ingredientes e agentes alergênicos
 */
export const initializeReferenceMaps = async () => {
  if (isInitialized) {
    return { ingredientsMap, allergenicAgentsMap };
  }

  try {
    // Buscar todos os ingredientes
    const ingredientsCollection = collection(db, "ingredientsList");
    const ingredientsSnapshot = await getDocs(ingredientsCollection);
    
    // Criar mapa de ID -> nome para ingredientes
    ingredientsMap = {};
    ingredientsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      ingredientsMap[doc.id] = data.name || `Ingrediente ${doc.id}`;
    });
    
    // Buscar todos os agentes alergênicos
    const allergenicAgentsCollection = collection(db, "allergenicAgentsList");
    const allergenicAgentsSnapshot = await getDocs(allergenicAgentsCollection);
    
    // Criar mapa de ID -> nome para agentes alergênicos
    allergenicAgentsMap = {};
    allergenicAgentsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      allergenicAgentsMap[doc.id] = data.name || `Alergênico ${doc.id}`;
    });
    
    isInitialized = true;
    return { ingredientsMap, allergenicAgentsMap };
  } catch (error) {
    console.error("Erro ao inicializar mapas de referência:", error);
    return { ingredientsMap: {}, allergenicAgentsMap: {} };
  }
};

/**
 * Resolve um array de IDs de ingredientes para seus nomes correspondentes
 * @param {Array} ingredientIds - Array de IDs de ingredientes
 * @returns {Array} Array de objetos com id e nome dos ingredientes
 */
export const resolveIngredientReferences = (ingredientIds) => {
  if (!ingredientIds || !Array.isArray(ingredientIds)) {
    return [];
  }
  
  return ingredientIds.map(id => ({
    id,
    name: ingredientsMap[id] || `Ingrediente ${id}`
  }));
};

/**
 * Resolve um array de IDs de agentes alergênicos para seus nomes correspondentes
 * @param {Array} allergenicAgentIds - Array de IDs de agentes alergênicos
 * @returns {Array} Array de objetos com id e nome dos agentes alergênicos
 */
export const resolveAllergenicAgentReferences = (allergenicAgentIds) => {
  if (!allergenicAgentIds || !Array.isArray(allergenicAgentIds)) {
    return [];
  }
  
  return allergenicAgentIds.map(id => ({
    id,
    name: allergenicAgentsMap[id] || `Alergênico ${id}`
  }));
};

/**
 * Enriquece um produto com os nomes resolvidos de ingredientes e agentes alergênicos
 * @param {Object} product - Objeto do produto
 * @returns {Object} Produto enriquecido com nomes resolvidos
 */
export const enrichProductWithReferences = (product) => {
  if (!product) {
    return product;
  }
  
  // Resolver ingredientes
  const resolvedIngredients = resolveIngredientReferences(product.ingredientes);
  
  // Resolver agentes alergênicos
  const resolvedAllergenicAgents = resolveAllergenicAgentReferences(product.alergenicos);
  
  // Retornar produto enriquecido
  return {
    ...product,
    ingredientes: product.ingredientes, // Manter IDs originais
    ingredientesResolvidos: resolvedIngredients, // Adicionar objetos resolvidos
    ingredientesNomes: resolvedIngredients.map(item => item.name), // Adicionar apenas os nomes
    alergenicos: product.alergenicos, // Manter IDs originais
    alergenicosResolvidos: resolvedAllergenicAgents, // Adicionar objetos resolvidos
    alergenicosNomes: resolvedAllergenicAgents.map(item => item.name) // Adicionar apenas os nomes
  };
};
