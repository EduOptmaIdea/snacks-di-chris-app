import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../../src/firebase.ts'; // Ajustado para o caminho correto do firebase
// import '../styles/Products.css'; // Se houver um CSS específico, criar e importar

// Interface para definir a estrutura do objeto Product
interface ProductData {
  id: string;
  productname?: string;
  category?: string;
  categoria?: string; // Campo alternativo para categoria
  price?: number;
  currentStock?: number;
  available?: boolean;
  // Adicione outros campos conforme necessário
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const list = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Garantir que price e currentStock sejam números, com fallback para 0
          price: parseFloat(doc.data().price) || 0,
          currentStock: parseInt(doc.data().currentStock, 10) || 0,
        })) as ProductData[];
        setProducts(list);
      } catch (err) {
        console.error("Erro ao buscar produtos:", err);
        setError('Falha ao carregar produtos.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Funções placeholder para ações (serão implementadas depois)
  const handleNewProduct = () => {
    alert('Navegar para formulário de novo produto');
    // TODO: Implementar navegação ou modal para adicionar produto
  };

  const handleEditProduct = (productId: string) => {
    alert(`Editar produto ${productId}`);
    // TODO: Implementar navegação ou modal para editar produto
  };

  const handleDeleteProduct = (productId: string) => {
    alert(`Excluir produto ${productId}`);
    // TODO: Implementar lógica de exclusão com confirmação
  };

  return (
    <div className="admin-container p-4"> {/* Adicionado padding para espaçamento */}
      <div className="flex justify-between items-center mb-4"> {/* Flex container para título e botão */}
        <h1 className="text-2xl font-bold">Produtos</h1>
        <button 
          onClick={handleNewProduct}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          + Novo Produto
        </button>
      </div>

      {loading && <div className="text-center py-4">Carregando produtos...</div>}
      {error && <div className="text-red-500 text-center py-4">{error}</div>}

      {!loading && !error && (
        <div className="overflow-x-auto"> {/* Container para tabela responsiva */}
          <table className="min-w-full bg-white border border-gray-200"> {/* Estilos base Tailwind */}
            <thead>
              <tr className="bg-gray-100 border-b"> {/* Estilo cabeçalho */}
                <th className="text-left py-3 px-4 font-semibold text-sm">ID</th>
                <th className="text-left py-3 px-4 font-semibold text-sm">Nome</th>
                <th className="text-left py-3 px-4 font-semibold text-sm">Categoria</th>
                <th className="text-left py-3 px-4 font-semibold text-sm">Preço</th>
                <th className="text-left py-3 px-4 font-semibold text-sm">Estoque</th>
                <th className="text-left py-3 px-4 font-semibold text-sm">Disponível</th>
                <th className="text-left py-3 px-4 font-semibold text-sm">Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-500">Nenhum produto encontrado.</td>
                </tr>
              ) : (
                products.map(p => (
                  <tr key={p.id} className="border-b hover:bg-gray-50"> {/* Estilo linha */}
                    <td className="py-3 px-4 text-sm text-gray-700 break-all">{p.id}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{p.productname || 'N/A'}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{p.category || p.categoria || 'N/A'}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">R$ {p.price?.toFixed(2) ?? '0.00'}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{p.currentStock ?? 0}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{p.available ? 'Sim' : 'Não'}</td>
                    <td className="py-3 px-4 text-sm text-gray-700 whitespace-nowrap"> {/* Ações */} 
                      <button 
                        onClick={() => handleEditProduct(p.id)} 
                        className="text-blue-500 hover:text-blue-700 mr-2"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(p.id)} 
                        className="text-red-500 hover:text-red-700"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Products;

