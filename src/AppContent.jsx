import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import './styles/App.css';
import './styles/fonts.css';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './components/Header';
import Footer from './components/Footer';
import { WHATSAPP_URL } from './constants';
import { ChevronsUp } from 'lucide-react';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import { initializeReferenceMaps, enrichProductWithReferences } from './services/firestore-references';

// Componentes carregados de forma lazy
const Home = lazy(() => import('./components/Home'));
const Menu = lazy(() => import('./components/Menu'));
const ProductsDetails = lazy(() => import('./components/ProductsDetails'));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));
const ShoppinCart = lazy(() => import('./components/ShoppinCart'));
const Checkout = lazy(() => import('./components/Checkout'));
const CookieConsent = lazy(() => import('./components/CookieConsent'));

// Componente de loading para Suspense
const Loading = () => <div>Carregando...</div>;

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

function AppContent() {
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

  // Ordem fixa das categorias
  const ordemFixaCategorias = [
    'Batata recheada',
    'Batata Rosti',
    'Mandioca Rosti',
    'Sobremesas',
    'Bebidas'
  ];

  // Lógica para buscar produtos do Firebase (Firestore)
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
            productname,
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

  // Scroll to top
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [frame]);

  // Scroll button
  useEffect(() => {
    const handleScroll = throttle(() => {
      setShowScrollButton(window.scrollY > 300);
    }, 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Atualiza frame conforme URL
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    if (path === '/politica-de-privacidade') {
      setFrame('privacy');
    } else if (path === '/cardapio') {
      setFrame(3);
    } else if (path.startsWith('/admin')) {
      setFrame('admin');
    } else {
      setFrame(1);
    }
  }, [location.pathname]);

  // Funções do carrinho, detalhes, etc. permanecem iguais
  // (mantenha todas as funções abaixo como estão)

  return (
    <div className="App">
      {!location.pathname.startsWith('/admin') && (
        <Header
          frame={frame}
          handleMenuClick={handleMenuClick}
          openWhatsApp={openWhatsApp}
          irParaCarrinho={irParaCarrinho}
          carrinho={carrinho}
        />
      )}

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
          {frame === 5 && produtoSelecionado && (
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
        {showCarrinho && <ShoppinCart />}
        {showFinalizacao && <Checkout />}
      </Suspense>

      {showScrollButton && (
        <button title="Voltar ao topo" className="button-to-top active" onClick={scrollToTop}>
          <div><ChevronsUp /></div>
          <div>Voltar ao topo</div>
        </button>
      )}

      {!location.pathname.startsWith('/admin') && (
        <>
          <Suspense fallback={null}>
            <Footer />
            <CookieConsent />
          </Suspense>
        </>
      )}
    </div>
  );
}

export default AppContent;