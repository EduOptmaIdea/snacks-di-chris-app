import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import '../styles/Dashboard.css';

function Dashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsCollection = collection(db, 'products');
        const productsSnapshot = await getDocs(productsCollection);
        const productList = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productList);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
      }
    };

    fetchProducts();
  }, []);

  // Função para atualizar campos no Firestore
  const handleUpdateProduct = async (productId, field, value) => {
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, { [field]: value });
    setProducts(prevProducts =>
      prevProducts.map(p => (p.id === productId ? { ...p, [field]: value } : p))
    );
  };

  return (
    <div className="dashboard">
      <h1>Dashboard Administrativo</h1>
      {loading && <div>Carregando...</div>}
      {!loading && products.length === 0 && <div>Nenhum produto encontrado.</div>}
      {!loading && products.length > 0 && (
        <table>
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
                <td>{product.productname || 'Sem Nome'}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={product.available}
                    onChange={() => handleUpdateProduct(product.id, 'available', !product.available)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={product.currentStock || 0}
                    onChange={(e) =>
                      handleUpdateProduct(product.id, 'currentStock', parseInt(e.target.value, 10))
                    }
                  />
                </td>
                <td>
                  {/* Botões de ação futuros */}
                  {/* Excluir, editar detalhes, etc. */}
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