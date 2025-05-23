import * as admin from "firebase-admin";
admin.initializeApp();

// Importar funções (caminhos relativos dentro da pasta src)
import * as activityLogger from "./activityLogger";
import * as sessionManager from "./sessionManager";
import * as permissionChecker from "./permissionChecker";
import * as userManager from "./userManager";
import * as systemInitializer from "./systemInitializer";

// Exportar funções
export const logActivity = activityLogger.logActivity;
export const trackUserChanges = activityLogger.trackUserChanges;

export const endAllSessions = sessionManager.endAllSessions;
export const cleanupOldSessions = sessionManager.cleanupOldSessions;
export const checkInactiveSessions = sessionManager.checkInactiveSessions;

export const checkPermission = permissionChecker.checkPermission;
export const validateResourceAccess = permissionChecker.validateResourceAccess;

export const checkExpiredUsers = userManager.checkExpiredUsers;

export const initializeSystem = systemInitializer.initializeSystem;
