import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
// Corrigido caminho do import do Firebase e CSS
import { db } from '../../firebase';
import '../styles/Dashboard.css';
import { usePageTitle } from '../../hooks/usePageTitle';

function Dashboard() {
  usePageTitle();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingProductId, setEditingProductId] = useState(null); // Track which product is being edited
  const [editError, setEditError] = useState(''); // Specific error for editing

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const productsCollection = collection(db, 'products');
        const productsSnapshot = await getDocs(productsCollection);
        if (!productsSnapshot.empty) {
          const productList = productsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            // Garantir que campos numéricos sejam tratados como números
            price: parseFloat(doc.data().price) || 0,
            currentStock: parseInt(doc.data().currentStock, 10) || 0,
            // Adicionar campos futuros com valores padrão
            views: parseInt(doc.data().views, 10) || 0,
            quantitySold: parseInt(doc.data().quantitySold, 10) || 0,
            salesQuantity: parseInt(doc.data().salesQuantity, 10) || 0,
            descontinued: doc.data().descontinued === true // Garantir que seja boolean
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
    setEditingProductId(productId); // Indicate editing started
    setEditError(''); // Clear previous edit errors
    console.log(`Tentando atualizar produto ${productId}, campo ${field} para ${value}`); // Log de depuração

    // Garantir que o valor do estoque seja um número
    if (field === 'currentStock') {
      const numericValue = parseInt(value, 10);
      if (isNaN(numericValue) || numericValue < 0) {
        console.error('Valor inválido para estoque:', value);
        setEditError('Estoque deve ser um número não negativo.');
        setEditingProductId(null);
        return; // Impede a atualização com valor inválido
      }
      value = numericValue;
    }

    // Garantir que 'available' e 'descontinued' sejam booleanos
    if (field === 'available' || field === 'descontinued') {
      value = Boolean(value);
    }

    try {
      const productRef = doc(db, 'products', productId);
      // Adiciona updatedAt para rastrear a última modificação
      await updateDoc(productRef, {
        [field]: value,
        updatedAt: serverTimestamp() // Atualiza o timestamp da modificação
      });
      console.log(`Produto ${productId} atualizado com sucesso.`); // Log de sucesso
      // Atualiza o estado local SOMENTE após a confirmação do Firestore
      setProducts(prev =>
        prev.map(p => (p.id === productId ? { ...p, [field]: value, updatedAt: new Date() } : p))
      );
    } catch (err) {
      console.error(`Erro ao atualizar ${field} do produto ${productId}:`, err);
      // Exibir erro mais detalhado
      setEditError(`Falha ao atualizar ${field}. Verifique o console para detalhes.`);
      // Reverter a mudança visual se a atualização falhar (opcional, mas bom para UX)
      // fetchProducts(); // Ou recarregar os dados para garantir consistência
    } finally {
      setEditingProductId(null); // Indicate editing finished
    }
  };

  return (
    <div className="dashboard">
      <h1>Dashboard Administrativo</h1>

      {loading && <div className="dashboard-loading">Carregando produtos...</div>}
      {error && <div className="dashboard-error">{error}</div>}
      {editError && <div className="dashboard-error" style={{ marginTop: '10px' }}>Erro ao editar: {editError}</div>} {/* Display edit error */}

      {!loading && products.length === 0 && !error && (
        <div className="dashboard-empty">Nenhum produto disponível.</div>
      )}

      {!loading && products.length > 0 && (
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Preço</th>
              <th>Disponível</th>
              <th>Descontinuado</th>
              <th>Estoque Atual</th>
              <th>Visualizações</th>
              <th>Qtd. Vendida</th>
              <th>Vendas</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>{products.map(product => (
            <tr key={product.id} className={editingProductId === product.id ? 'editing' : ''}>{/* Highlight row being edited */}<td>{product.productname || product.name || 'Sem nome'}</td><td>R$ {product.price?.toFixed(2) || '0.00'}</td><td><input type="checkbox" checked={product.available === true} onChange={(e) => handleUpdateProduct(product.id, 'available', e.target.checked)} disabled={editingProductId === product.id} /></td><td><input type="checkbox" checked={product.descontinued === true} onChange={(e) => handleUpdateProduct(product.id, 'descontinued', e.target.checked)} disabled={editingProductId === product.id} /></td><td><input type="number" min="0" defaultValue={product.currentStock || 0} onBlur={(e) => handleUpdateProduct(product.id, 'currentStock', e.target.value)} disabled={editingProductId === product.id} style={{ width: '70px' }} /></td><td>{product.views || 0}</td><td>{product.quantitySold || 0}</td><td>{product.salesQuantity || 0}</td><td><button onClick={() => alert(`Editar ${product.id}`)} disabled={editingProductId === product.id}>Editar</button></td></tr>
          ))}</tbody>
        </table>
      )}
    </div>
  );
}

export default Dashboard;

