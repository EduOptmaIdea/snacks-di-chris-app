import { createContext } from 'react'; // Removido 'React' não utilizado
import { User } from 'firebase/auth'; // Firebase Auth User type

// Define the shape of the user data we'll store from adminUser collection
interface AdminUserData {
    uid: string;
    available: boolean;
    email: string | null;
    fullName?: string;
    userName?: string;
    avatar?: string;
    role?: string;
    permissions?: { [key: string]: string[] }; // e.g., { products: ['read', 'write'] }
    // Add other relevant fields from your adminUser collection
}

// Define the shape of the Auth Context
interface AuthContextType {
    currentUser: User | null; // Firebase Auth user object
    adminUser: AdminUserData | null; // Custom user data from Firestore
    loading: boolean; // Loading state for auth status
    error: string | null; // Error state
    // We might add login/logout functions here later if needed directly in context,
    // but often they are handled in components using Firebase SDK directly.
}

// Create the context with default values
export const AuthContext = createContext<AuthContextType>({
    currentUser: null,
    adminUser: null,
    loading: true, // Start in loading state until auth status is checked
    error: null,
});

// Export the type for use in the Provider and hook
export type { AuthContextType, AdminUserData };

