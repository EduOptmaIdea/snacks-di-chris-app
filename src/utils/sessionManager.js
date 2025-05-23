import { collection, addDoc, doc, updateDoc, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

/**
 * Cria uma nova sessão ao fazer login
 * @param {string} userId - ID do usuário
 * @returns {Promise<string>} - ID da sessão criada
 */
export async function createUserSession(userId) {
  try {
    const sessionsRef = collection(db, "adminUser", userId, "sessions");
    
    // Detectar tipo de dispositivo
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isTablet = /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent);
    const deviceType = isMobile ? "Mobile" : isTablet ? "Tablet" : "Desktop";
    
    // Obter localização aproximada (opcional)
    let location = { country: "Desconhecido", city: "Desconhecido" };
    try {
      const geoResponse = await fetch("https://ipapi.co/json/" );
      const geoData = await geoResponse.json();
      location = {
        country: geoData.country_name || "Desconhecido",
        city: geoData.city || "Desconhecido"
      };
    } catch (error) {
      console.error("Erro ao obter localização:", error);
    }
    
    // Criar documento de sessão
    const sessionDoc = await addDoc(sessionsRef, {
      startTime: serverTimestamp(),
      endTime: null,
      ipAddress: await getIpAddress(),
      userAgent: navigator.userAgent,
      device: deviceType,
      location,
      active: true
    });
    
    // Armazenar ID da sessão localmente
    localStorage.setItem("sessionId", sessionDoc.id);
    
    // Atualizar contador de logins do usuário
    const userRef = doc(db, "adminUser", userId);
    await updateDoc(userRef, {
      lastLogin: serverTimestamp(),
      loginCount: increment(1)
    });
    
    return sessionDoc.id;
  } catch (error) {
    console.error("Erro ao criar sessão:", error);
    return null;
  }
}

/**
 * Encerra a sessão atual ao fazer logout
 * @param {string} userId - ID do usuário
 * @returns {Promise<boolean>} - Se a operação foi bem-sucedida
 */
export async function endUserSession(userId) {
  try {
    const sessionId = localStorage.getItem("sessionId");
    
    if (sessionId) {
      const sessionRef = doc(db, "adminUser", userId, "sessions", sessionId);
      
      await updateDoc(sessionRef, {
        endTime: serverTimestamp(),
        active: false
      });
      
      localStorage.removeItem("sessionId");
      console.log("Sessão encerrada com sucesso");
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Erro ao encerrar sessão:", error);
    return false;
  }
}

/**
 * Encerra todas as sessões ativas do usuário
 * @param {string} userId - ID do usuário
 * @returns {Promise<number>} - Número de sessões encerradas
 */
export async function endAllUserSessions(userId) {
  try {
    const sessionsRef = collection(db, "adminUser", userId, "sessions");
    const activeSessionsQuery = query(sessionsRef, where("active", "==", true));
    const sessionsSnapshot = await getDocs(activeSessionsQuery);
    
    const updatePromises = [];
    
    sessionsSnapshot.forEach((sessionDoc) => {
      const sessionRef = doc(db, "adminUser", userId, "sessions", sessionDoc.id);
      updatePromises.push(
        updateDoc(sessionRef, {
          endTime: serverTimestamp(),
          active: false
        })
      );
    });
    
    await Promise.all(updatePromises);
    localStorage.removeItem("sessionId");
    
    console.log(`${updatePromises.length} sessões encerradas com sucesso`);
    return updatePromises.length;
  } catch (error) {
    console.error("Erro ao encerrar todas as sessões:", error);
    return 0;
  }
}

/**
 * Função auxiliar para obter o endereço IP
 * @returns {Promise<string>} - Endereço IP
 */
async function getIpAddress() {
  try {
    const response = await fetch("https://api.ipify.org?format=json" );
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error("Erro ao obter IP:", error);
    return "Desconhecido";
  }
}
