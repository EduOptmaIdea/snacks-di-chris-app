import { useContext } from 'react';
import { AuthContext } from './AuthContext';

// Custom hook to easily consume the Auth Context
export const useAuth = () => {
    return useContext(AuthContext);
};

