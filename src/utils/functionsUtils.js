import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";

/**
 * Chama uma Cloud Function
 * @param {string} functionName - Nome da função
 * @param {Object} data - Dados a serem enviados
 * @returns {Promise<any>} - Resultado da função
 */
export async function callFunction(functionName, data = {}) {
    try {
        const functionRef = httpsCallable(functions, functionName);
        const result = await functionRef(data);
        return result.data;
    } catch (error) {
        console.error(`Erro ao chamar função ${functionName}:`, error);
        throw error;
    }
}