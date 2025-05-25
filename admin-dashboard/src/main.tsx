import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { AuthProvider } from './context/AuthProvider'; // Importar o AuthProvider

console.log("[main.tsx] Executing main.tsx..."); // Log de execução

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        {/* Envolver o App com o AuthProvider */}
        <AuthProvider>
            <App />
        </AuthProvider>
    </StrictMode>,
);

