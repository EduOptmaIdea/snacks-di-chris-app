import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import '../styles/Dashboard.css';
import { usePageTitle } from '../../hooks/usePageTitle';

function Dashboard() {
  usePageTitle();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsCollection = collection(db, 'products');
        const productsSnapshot = await getDocs(productsCollection);
        if (!productsSnapshot.empty) {
          const productList = productsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setProducts(productList);
        } else {
          setProducts([]);
          setError('Nenhum produto encontrado.');
        }
      } catch (err) {
        console.error('Erro ao buscar produtos:', err);
        setError('Falha ao carregar dados dos produtos.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Função para atualizar campos no Firestore
  const handleUpdateProduct = async (productId, field, value) => {
    try {
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, { [field]: value });
      setProducts(prev =>
        prev.map(p => (p.id === productId ? { ...p, [field]: value } : p))
      );
    } catch (err) {
      console.error('Erro ao atualizar produto:', err);
      alert('Falha ao atualizar produto!');
    }
  };

  return (
    <div className="dashboard">
      <h1>Dashboard Administrativo</h1>

      {loading && <div className="dashboard-loading">Carregando produtos...</div>}
      {error && <div className="dashboard-error">{error}</div>}

      {!loading && products.length === 0 && !error && (
        <div className="dashboard-empty">Nenhum produto disponível.</div>
      )}

      {!loading && products.length > 0 && (
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Disponível</th>
              <th>Estoque Atual</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.productname || product.name || 'Sem nome'}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={product.available || false}
                    onChange={() =>
                      handleUpdateProduct(
                        product.id,
                        'available',
                        !product.available
                      )
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={product.currentStock || 0}
                    onChange={(e) =>
                      handleUpdateProduct(
                        product.id,
                        'currentStock',
                        parseInt(e.target.value, 10) || 0
                      )
                    }
                  />
                </td>
                <td>
                  {/* Botões futuros */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Dashboard;