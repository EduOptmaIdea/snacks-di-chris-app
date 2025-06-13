import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../../../../src/firebase.ts'; // Ajustado para o caminho correto do firebase
import '../../styles/Dashboard.css'; // Ajustado para o caminho correto do CSS
import { usePageTitle } from '../../hooks/usePageTitle.ts'; // Ajustado para o caminho correto do hook

// Interface para definir a estrutura do objeto Product
interface Product {
  id: string;
  productname?: string; // Nome pode ser opcional ou vir de outro campo
  name?: string; // Nome alternativo
  price: number;
  available?: boolean;
  descontinued?: boolean;
  currentStock: number;
  views?: number;
  quantitySold?: number;
  salesQuantity?: number;
  updatedAt?: Date | Timestamp; // Pode ser Date localmente ou Timestamp do Firestore
  // Adicione outros campos conforme necessário
}

const Dashboard: React.FC = () => {
  usePageTitle(); // Hook para título da página

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editError, setEditError] = useState<string>('');

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
            price: parseFloat(doc.data().price) || 0,
            currentStock: parseInt(doc.data().currentStock, 10) || 0,
            views: parseInt(doc.data().views, 10) || 0,
            quantitySold: parseInt(doc.data().quantitySold, 10) || 0,
            salesQuantity: parseInt(doc.data().salesQuantity, 10) || 0,
            available: doc.data().available === true, // Garantir boolean
            descontinued: doc.data().descontinued === true, // Garantir boolean
            updatedAt: doc.data().updatedAt // Manter o timestamp
          })) as Product[]; // Cast para o tipo Product[]
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
  const handleUpdateProduct = async (productId: string, field: keyof Product, value: string | boolean) => {
    setEditingProductId(productId);
    setEditError('');
    console.log(`Tentando atualizar produto ${productId}, campo ${field} para ${value}`);

    // Definir tipo explícito para processedValue
    let processedValue: string | boolean | number = value;

    if (field === 'currentStock') {
      // Garantir que value é string antes de parseInt
      if (typeof value === 'string') {
        const numericValue = parseInt(value, 10);
        if (isNaN(numericValue) || numericValue < 0) {
          console.error('Valor inválido para estoque:', value);
          setEditError('Estoque deve ser um número não negativo.');
          setEditingProductId(null);
          return;
        }
        processedValue = numericValue;
      } else {
        // Se não for string, não deve ser estoque (ou é erro de lógica)
        console.error('Tipo inesperado para estoque:', typeof value);
        setEditError('Erro interno ao processar estoque.');
        setEditingProductId(null);
        return;
      }
    }

    if (field === 'available' || field === 'descontinued') {
      // Boolean já é tratado corretamente
      processedValue = Boolean(value);
    }

    try {
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, {
        [field]: processedValue,
        updatedAt: serverTimestamp()
      });
      console.log(`Produto ${productId} atualizado com sucesso.`);
      // Atualiza o estado local
      setProducts(prev =>
        prev.map(p => (p.id === productId ? { ...p, [field]: processedValue, updatedAt: new Date() } : p))
      );
    } catch (err) {
      console.error(`Erro ao atualizar ${field} do produto ${productId}:`, err);
      setEditError(`Falha ao atualizar ${field}. Verifique o console para detalhes.`);
    } finally {
      setEditingProductId(null);
    }
  };

  return (
    <div className="dashboard">
      <h1 className='items-start'>Dashboard Administrativo</h1>

      {loading && <div className="dashboard-loading">Carregando produtos...</div>}
      {error && <div className="dashboard-error">{error}</div>}
      {editError && <div className="dashboard-error" style={{ marginTop: '10px' }}>Erro ao editar: {editError}</div>}

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
              {/* <th>Ações</th> */}
            </tr>
          </thead>
          <tbody>{products.map(product => (
            <tr key={product.id} className={editingProductId === product.id ? 'editing' : ''}>
              <td>{product.productname || product.name || 'Sem nome'}</td>
              <td>R$ {product.price?.toFixed(2) || '0.00'}</td>
              <td>
                <input
                  type="checkbox"
                  checked={product.available === true}
                  onChange={(e) => handleUpdateProduct(product.id, 'available', e.target.checked)}
                  disabled={editingProductId === product.id}
                />
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={product.descontinued === true}
                  onChange={(e) => handleUpdateProduct(product.id, 'descontinued', e.target.checked)}
                  disabled={editingProductId === product.id}
                />
              </td>
              <td>
                <input
                  type="number"
                  min="0"
                  defaultValue={product.currentStock || 0}
                  // O valor do input number é sempre string, então a checagem no handleUpdateProduct funcionará
                  onBlur={(e) => handleUpdateProduct(product.id, 'currentStock', e.target.value)}
                  disabled={editingProductId === product.id}
                  style={{ width: '70px' }}
                />
              </td>
              <td>{product.views || 0}</td>
              <td>{product.quantitySold || 0}</td>
              <td>{product.salesQuantity || 0}</td>
              {/* <td><button onClick={() => alert(`Editar ${product.id}`)} disabled={editingProductId === product.id}>Editar</button></td> */}
            </tr>
          ))}</tbody>
        </table>
      )}
    </div>
  );
};

export default Dashboard;

