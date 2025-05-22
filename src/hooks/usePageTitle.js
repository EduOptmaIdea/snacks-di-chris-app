import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function usePageTitle() {
  const location = useLocation();
  
  useEffect(() => {
    if (location.pathname.startsWith('/admin')) {
      document.title = 'SNACKS di Chris | Área Administrativa';
    } else {
      document.title = 'SNACKS di Chris | Loja Gostosuras';
    }
  }, [location.pathname]);
}