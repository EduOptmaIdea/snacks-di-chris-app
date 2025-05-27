import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, useParams, Navigate } from 'react-router-dom';
import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import './styles/App.css';
import './styles/fonts.css';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './components/Header';
import Footer from './components/Footer';
import { WHATSAPP_URL } from './constants';
import { ChevronsUp } from 'lucide-react';
import { db } from './firebase.ts';
import { collection, getDocs } from "firebase/firestore";
import { initializeReferenceMaps, enrichProductWithReferences } from './services/firestore-references';
import { usePageTitle } from './hooks/usePageTitle';

// --- Importações do Admin Dashboard ---
import { AuthProvider } from '../admin-dashboard/src/context/AuthProvider.tsx';
import AuthGuard from '../admin-dashboard/src/components/auth/AuthGuard.tsx';
import AdminLayout from '../admin-dashboard/src/components/layout/Layout.tsx';
import AdminLoginPage from '../admin-dashboard/src/components/auth/LoginPage.tsx';
import AdminDashboard from '../admin-dashboard/src/components/dashboard/Dashboard.tsx';
import UserList from '../admin-dashboard/src/components/users/UserList.tsx';
import UserForm from '../admin-dashboard/src/components/users/UserForm.tsx';
import AdminProductsPage from '../admin-dashboard/src/components/products/Products.tsx'; // Importar o novo componente de produtos
import AdminCategoriesPage from '../admin-dashboard/src/components/categories/Categories.tsx'; // Importar o novo componente de produtos
import AdminIngredientsPage from '../admin-dashboard/src/components/ingredients/Ingredients.tsx'; // Importar o novo componente de ingredientes
import AdminAlergenicsPage from '../admin-dashboard/src/components/alergenics/Alergenics.tsx'; // Importar o novo componente de ingredientes
// --- Fim das Importações do Admin Dashboard ---

// Componentes carregados de forma lazy (Cliente)
const Home = lazy(() => import('./components/Home'));
const Menu = lazy(() => import('./components/Menu'));
const ProductsDetails = lazy(() => import('./components/ProductsDetails'));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));
const ShoppinCart = lazy(() => import('./components/ShoppinCart'));
const Checkout = lazy(() => import('./components/Checkout'));
const CookieConsent = lazy(() => import('./components/CookieConsent'));

// Componente de loading para Suspense
const Loading = () => (
  <div className="loading-container">
    <div className="loading-spinner"></div>
  </div>
);

function throttle(func, limit) {
  let lastFunc;
  let lastRan;
  return function () {
    const context = this;
    const args = arguments;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function () {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}

// Componente principal com lógica do App Cliente
function AppContent() {
  const location = useLocation();
  const [frame, setFrame] = useState(1);
  const [categorias, setCategorias] = useState([]);
  const [products, setProducts] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [carrinho, setCarrinho] = useState([]);
  const [showCarrinho, setShowCarrinho] = useState(false);
  const [showFinalizacao, setShowFinalizacao] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const navigate = useNavigate();

  const ordemFixaCategorias = [
    'Batata recheada',
    'Batata Rosti',
    'Mandioca Rosti',
    'Sobremesas',
    'Bebidas'
  ];

  usePageTitle();

  useEffect(() => {
    const path = location.pathname;
    // Título dinâmico agora é tratado pelo usePageTitle e rotas admin
  }, [location.pathname]);

  useEffect(() => {
    const fetchFirebaseProducts = async () => {
      try {
        await initializeReferenceMaps();
        const categoriesCollection = collection(db, "categories");
        const categoriesSnapshot = await getDocs(categoriesCollection);

        const categoryMap = {};
        const categoriesList = [];
        categoriesSnapshot.docs.forEach(doc => {
          const data = doc.data();
          const categoryName = data.category || "Categoria " + doc.id;
          categoryMap[doc.id] = categoryName;
          categoriesList.push({
            id: doc.id,
            category: categoryName,
            name: categoryName,
            description: data.description || "",
            image: data.image || '',
            order: data.order || 999
          });
        });

        categoriesList.sort((a, b) => {
          const indexA = ordemFixaCategorias.indexOf(a.category);
          const indexB = ordemFixaCategorias.indexOf(b.category);
          if (indexA !== -1 && indexB !== -1) return indexA - indexB;
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
          return a.order - b.order;
        });

        setCategorias(categoriesList);

        const productsCollection = collection(db, "products");
        const productSnapshot = await getDocs(productsCollection);
        const productList = await Promise.all(productSnapshot.docs.map(async (doc) => {
          const data = doc.data();
          let categoryName = "Categoria Desconhecida";
          let categoryId = "";
          if (data.categoryRef) {
            if (typeof data.categoryRef === 'string') {
              categoryId = data.categoryRef;
              categoryName = categoryMap[data.categoryRef] || "Categoria " + data.categoryRef;
            } else if (data.categoryRef?.path) {
              categoryId = data.categoryRef.path.split('/').pop();
              categoryName = categoryMap[categoryId] || "Categoria " + categoryId;
            }
          }

          const productname = data.productname || data.name || '';
          const produto = {
            id: doc.id,
            productname: productname,
            name: productname,
            nome: productname,
            description: data.description || '',
            price: data.price || 0,
            preco: data.price || 0,
            image: data.image || '',
            imagePath: data.imagePath || '',
            images: data.image || data.imagePath || '',
            categoria: categoryName,
            category: categoryName,
            categoryId: categoryId,
            available: data.available !== undefined ? data.available : true,
            descontinued: data.descontinued !== undefined ? data.descontinued : false,
            ingredientes: data.ingredientRefs || [],
            alergenicos: data.allergenicAgentRefs || []
          };

          return enrichProductWithReferences(produto);
        }));

        const filteredProducts = productList.filter(product => !product.descontinued);
        setProducts(filteredProducts);
      } catch (error) {
        console.error("Erro ao buscar produtos do Firestore: ", error);
      }
    };
    fetchFirebaseProducts();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [frame]);

  useEffect(() => {
    const handleScroll = throttle(() => {
      setShowScrollButton(window.scrollY > 300);
    }, 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const path = location.pathname;
    if (path === '/politica-de-privacidade') {
      setFrame('privacy');
    } else if (path === '/cardapio') {
      setFrame(3);
    } else if (path.startsWith('/produto/')) {
      setFrame(5); // Assume frame 5 for product details
      const productId = path.split('/').pop();
      const product = products.find(p => p.id === productId);
      setProdutoSelecionado(product || null);
    } else if (path === '/') {
      setFrame(1);
    }
    // Não definir frame para '/admin' aqui, pois AppContent não deve controlar o admin
  }, [location.pathname, products]);

  const handleMenuClick = (targetFrame) => {
    setCategoriaSelecionada(null);
    setFrame(targetFrame);
    if (targetFrame === 1) navigate('/');
    if (targetFrame === 3) navigate('/cardapio');
    if (targetFrame === 'privacy') navigate('/politica-de-privacidade');
  };

  const handleProdutoClick = (produto) => {
    setProdutoSelecionado(produto);
    setFrame(5);
    navigate(`/produto/${produto.id}`); // Navega para a URL do produto
  };

  const closeProdutoDetalhes = () => {
    setProdutoSelecionado(null);
    setFrame(3);
    navigate('/cardapio');
  };

  const openWhatsApp = () => {
    window.open(WHATSAPP_URL, '_blank');
  };

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const produtosFiltrados = categoriaSelecionada
    ? categoriaSelecionada.category
      ? products.filter(p => p.categoria === categoriaSelecionada.category || p.category === categoriaSelecionada.category)
      : products.filter(p => p.categoryId === categoriaSelecionada.id)
    : products;

  const produtoDetalhado = produtoSelecionado
    ? {
      ...produtoSelecionado,
      ingredientesDetalhados: produtoSelecionado.ingredientesNomes || [],
      alergenicosDetalhados: produtoSelecionado.alergenicosNomes || []
    }
    : null;

  const adicionarAoCarrinho = (novoItem) => {
    if (novoItem.available === false) return;

    const itemComNome = {
      ...novoItem,
      productname: novoItem.productname || novoItem.name || novoItem.nome || "Produto",
      name: novoItem.productname || novoItem.name || novoItem.nome || "Produto",
      nome: novoItem.productname || novoItem.name || novoItem.nome || "Produto"
    };

    setCarrinho((carrinhoAtual) => {
      const existente = carrinhoAtual.find(item =>
        item.id === itemComNome.id &&
        item.comentario === itemComNome.comentario
      );
      if (existente) {
        return carrinhoAtual.map(item =>
          item === existente
            ? { ...item, quantidade: item.quantidade + itemComNome.quantidade }
            : item
        );
      } else {
        return [...carrinhoAtual, { ...itemComNome }];
      }
    });
  };

  const abrirFinalizacao = () => {
    setShowCarrinho(false);
    setShowFinalizacao(true);
    navigate('/finalizar-pedido');
  };

  const fecharFinalizacao = () => {
    setShowFinalizacao(false);
    setFrame(3);
    navigate('/cardapio');
  };

  const irParaCarrinho = () => {
    setShowCarrinho(true);
    // Não navegar para /carrinho, pois é um modal/overlay
  };
  const fecharCarrinho = () => setShowCarrinho(false);
  const limparCarrinho = () => setCarrinho([]);
  const removerItem = (id) => setCarrinho(prev => prev.filter(item => item.id !== id));
  const voltarParaProdutos = () => {
    setCategoriaSelecionada(null);
    setProdutoSelecionado(null);
    setFrame(3);
    navigate('/cardapio');
  };
  const voltarParaInicio = () => {
    setCategoriaSelecionada(null);
    setProdutoSelecionado(null);
    setFrame(1);
    navigate('/');
  };
  const atualizarQuantidade = (id, novaQuantidade) => {
    setCarrinho((prevCarrinho) =>
      prevCarrinho.map(item =>
        item.id === id ? { ...item, quantidade: novaQuantidade } : item
      )
    );
  };

  // Renderiza apenas a parte do cliente
  return (
    <div className="App">
      <Header
        frame={frame}
        handleMenuClick={handleMenuClick}
        openWhatsApp={openWhatsApp}
        irParaCarrinho={irParaCarrinho}
        carrinho={carrinho}
      />

      <AnimatePresence mode="wait">
        <Suspense fallback={<Loading />}>
          {frame === 1 && (
            <motion.div key="frame1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Home onCategoriaClick={(categoria) => {
                setCategoriaSelecionada(categoria);
                setFrame(3);
                navigate('/cardapio');
              }} categorias={categorias} />
            </motion.div>
          )}
          {frame === 3 && (
            <motion.div key="frame3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Menu
                categoriaSelecionada={categoriaSelecionada}
                produtos={produtosFiltrados}
                onProdutoClick={handleProdutoClick}
                categoriasFromFirebase={categorias}
                categoriasOrdenadas={ordemFixaCategorias}
                onVoltar={() => {
                  setCategoriaSelecionada(null);
                  setFrame(1);
                  navigate('/');
                }}
              />
            </motion.div>
          )}
          {frame === 'privacy' && (
            <motion.div key="privacy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <PrivacyPolicy />
            </motion.div>
          )}
          {frame === 5 && produtoDetalhado && (
            <ProductsDetails
              produto={produtoDetalhado}
              onClose={closeProdutoDetalhes}
              adicionarAoCarrinho={adicionarAoCarrinho}
              irParaCarrinho={irParaCarrinho}
              voltarParaProdutos={voltarParaProdutos}
            />
          )}
        </Suspense>
      </AnimatePresence>

      <Suspense fallback={null}>
        {showCarrinho && (
          <ShoppinCart
            items={carrinho}
            onClose={fecharCarrinho}
            onRemoveItem={removerItem}
            onClearCart={limparCarrinho}
            voltarParaProdutos={voltarParaProdutos}
            onUpdateQuantidade={atualizarQuantidade}
            onFinalizarPedido={abrirFinalizacao}
          />
        )}
        {showFinalizacao && (
          <Checkout
            carrinho={carrinho}
            totalPedido={carrinho.reduce((total, item) => total + item.preco * item.quantidade, 0)}
            onCancelar={fecharFinalizacao}
            limparCarrinho={limparCarrinho}
            voltarParaInicio={voltarParaInicio}
          />
        )}
      </Suspense>

      {showScrollButton && (
        <button title="Voltar ao topo" className="button-to-top active" onClick={scrollToTop}>
          <div><ChevronsUp /></div>
          <div>Voltar ao topo</div>
        </button>
      )}

      <Suspense fallback={null}>
        <Footer />
        <CookieConsent />
      </Suspense>
    </div>
  );
}

// --- Componentes Placeholder para Rotas Admin --- (Removidos ou substituídos)
const AdminUsers = () => {
  const navigate = useNavigate();
  return (
    <AdminLayout>
      <UserList
        onEdit={(id) => navigate(`/admin/users/${id}`)}
        onView={(id) => { /* Implementar visualização se necessário */ }}
        onDelete={(id) => { /* Implementar deleção se necessário */ }}
      />
    </AdminLayout>
  );
};
const AdminUserForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  return (
    <AdminLayout>
      <UserForm
        userId={id} // Passa o ID para edição ou undefined para criação
        onClose={() => navigate('/admin/users')}
        onSave={(data) => {
          console.log('Salvar usuário:', data);
          // Lógica para salvar usuário (criar ou atualizar)
          navigate('/admin/users');
        }}
      />
    </AdminLayout>
  );
};
const AdminCategories = () => <AdminLayout><div>Página de Categorias (Admin)</div></AdminLayout>;
// const AdminProducts = () => <AdminLayout><div>Página de Produtos (Admin)</div></AdminLayout>; // Placeholder removido
const AdminPermissions = () => <AdminLayout><div>Página de Permissões (Admin)</div></AdminLayout>;
const AdminSettings = () => <AdminLayout><div>Página de Configurações (Admin)</div></AdminLayout>;
const AdminIngredients = () => <AdminLayout><div>Página de Ingredientes utilizados (Admin)</div></AdminLayout>;
const AdminAlergenics = () => <AdminLayout><div>Página dos alergenos que podem conter (Admin)</div></AdminLayout>;
// --- Fim dos Componentes Placeholder --- 

// Roteador Principal Unificado
function AppRouter() {
  return (
    <Router>
      {/* AuthProvider envolve TODAS as rotas para que o contexto esteja disponível */}
      <AuthProvider>
        <Routes>
          {/* Rotas Públicas (Cliente) */}
          <Route path="/" element={<AppContent />} />
          <Route path="/cardapio" element={<AppContent />} />
          <Route path="/produto/:id" element={<AppContent />} />
          <Route path="/politica-de-privacidade" element={<AppContent />} />
          {/* Rotas de Carrinho e Checkout são gerenciadas internamente por AppContent como modais/overlays */}

          {/* --- Rotas Administrativas --- */}
          {/* Rota de Login do Admin - Não protegida */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Rotas Administrativas Protegidas */}
          <Route
            path="/admin"
            element={
              <AuthGuard>
                {/* Redireciona /admin para /admin/dashboard */}
                <Navigate to="/admin/dashboard" replace />
              </AuthGuard>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <AuthGuard>
                <AdminLayout><AdminDashboard /></AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AuthGuard>
                <AdminUsers />
              </AuthGuard>
            }
          />
          <Route
            path="/admin/users/new" // Rota para criar novo usuário
            element={
              <AuthGuard>
                <AdminUserForm />
              </AuthGuard>
            }
          />
          <Route
            path="/admin/users/:id" // Rota para editar usuário existente
            element={
              <AuthGuard>
                <AdminUserForm />
              </AuthGuard>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <AuthGuard>
                <AdminLayout><AdminCategoriesPage /></AdminLayout> {/* Usar o componente importado */}
              </AuthGuard>
            }
          />
          <Route
            path="/admin/ingredients"
            element={
              <AuthGuard>
                <AdminLayout><AdminIngredientsPage /></AdminLayout> {/* Usar o componente importado */}
              </AuthGuard>
            }
          />

          <Route
            path="/admin/products" // Rota para a nova página de produtos
            element={
              <AuthGuard>
                <AdminLayout><AdminProductsPage /></AdminLayout> {/* Usar o componente importado */}
              </AuthGuard>
            }
          />
          <Route
            path="/admin/permissions"
            element={
              <AuthGuard>
                <AdminPermissions />
              </AuthGuard>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <AuthGuard>
                <AdminSettings />
              </AuthGuard>
            }
          />
          <Route
            path="/admin/alergenics"
            element={
              <AuthGuard>
                <AdminLayout><AdminAlergenicsPage /></AdminLayout> {/* Usar o componente importado */}
              </AuthGuard>
            }
          />
          {/* --- Fim das Rotas Administrativas --- */}

          {/* Rota Catch-all */}
          <Route path="*" element={<div>Página não encontrada (404)</div>} />

        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default AppRouter;