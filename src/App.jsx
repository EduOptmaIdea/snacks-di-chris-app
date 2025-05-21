import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import './styles/App.css';
import './styles/fonts.css';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './components/Header';
import Footer from './components/Footer';
import { WHATSAPP_URL } from './constants';
import { ChevronsUp } from 'lucide-react';

import { db } from './firebase.ts';
import { collection, getDocs, query, orderBy, doc, getDoc } from "firebase/firestore";
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

// Componente principal que contém toda a lógica
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
        // Inicializar mapas de referência para ingredientes e alergênicos
        await initializeReferenceMaps();
        
        // Primeiro, buscar todas as categorias para criar um mapa de ID -> nome
        const categoriesCollection = collection(db, "categories");
        const categoriesSnapshot = await getDocs(categoriesCollection);
        
        // Criar um mapa de IDs de categoria para nomes de categoria
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
            image: data.image || "",
            order: data.order || 999
          });
        });
        
        // Ordenar categorias conforme a ordem fixa
        categoriesList.sort((a, b) => {
          const indexA = ordemFixaCategorias.indexOf(a.category);
          const indexB = ordemFixaCategorias.indexOf(b.category);
          
          // Se ambas as categorias estiverem na lista fixa, use a ordem da lista
          if (indexA !== -1 && indexB !== -1) {
            return indexA - indexB;
          }
          
          // Se apenas uma estiver na lista fixa, priorize-a
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
          
          // Se nenhuma estiver na lista fixa, use a ordem definida no Firestore
          return a.order - b.order;
        });
        
        setCategorias(categoriesList);
        
        // Agora, buscar os produtos
        const productsCollection = collection(db, "products");
        const productSnapshot = await getDocs(productsCollection);
        
        const productList = await Promise.all(productSnapshot.docs.map(async (doc) => {
          const data = doc.data();
          
          // Obter o nome da categoria a partir do ID
          let categoryName = "Categoria Desconhecida";
          let categoryId = "";
          
          if (data.categoryRef) {
            // Se categoryRef for um ID direto
            if (typeof data.categoryRef === 'string') {
              categoryId = data.categoryRef;
              categoryName = categoryMap[data.categoryRef] || "Categoria " + data.categoryRef;
            }
            // Se categoryRef for uma referência do Firestore
            else if (data.categoryRef.path) {
              categoryId = data.categoryRef.path.split('/').pop();
              categoryName = categoryMap[categoryId] || "Categoria " + categoryId;
            }
          }
          
          // Garantir que o nome do produto seja mapeado corretamente
          const productname = data.productname || data.name || '';
          
          const produto = {
            id: doc.id,
            productname: productname, // Garantir que o nome seja mapeado corretamente
            name: productname,        // Duplicar para compatibilidade
            nome: productname,        // Duplicar para compatibilidade
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
          
          // Enriquecer o produto com nomes de ingredientes e alergênicos
          const produtoEnriquecido = enrichProductWithReferences(produto);
          
          return produtoEnriquecido;
        }));
        
        const filteredProducts = productList.filter(
          product => !product.descontinued // Apenas remove descontinuados
        );

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
    const path = window.location.pathname;
    if (path === '/politica-de-privacidade') {
      setFrame('privacy');
    } else if (path === '/cardapio') {
      setFrame(3);
    } else {
      setFrame(1);
    }
  }, []);

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
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  // Lógica de filtragem corrigida para lidar com categorias vazias
  const produtosFiltrados = categoriaSelecionada
    ? categoriaSelecionada.category 
      ? products.filter(p => p.categoria === categoriaSelecionada.category || p.category === categoriaSelecionada.category)
      : products.filter(p => p.categoryId === categoriaSelecionada.id)
    : products; // Se não houver categoria selecionada, mostre todos os produtos

  const produtoDetalhado = produtoSelecionado
    ? {
      ...produtoSelecionado,
      // Usar os nomes resolvidos de ingredientes e alergênicos
      ingredientesDetalhados: produtoSelecionado.ingredientesNomes || 
        (produtoSelecionado.ingredientes
          ? (Array.isArray(produtoSelecionado.ingredientes) ? produtoSelecionado.ingredientes : produtoSelecionado.ingredientes.split(',').map(i => i.trim()))
          : []),
      alergenicosDetalhados: produtoSelecionado.alergenicosNomes || 
        (produtoSelecionado.alergenicos
          ? (Array.isArray(produtoSelecionado.alergenicos) ? produtoSelecionado.alergenicos : produtoSelecionado.alergenicos.split(',').map(a => a.trim()))
          : [])
    }
    : null;

  const adicionarAoCarrinho = (novoItem) => {
    // Verificar se o produto está disponível antes de adicionar ao carrinho
    if (novoItem.available === false) {
      return; // Não adiciona ao carrinho se o produto estiver indisponível
    }
    
    // Garantir que o nome do produto seja preservado
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
  };

  const fecharFinalizacao = () => {
    setShowFinalizacao(false);
    setFrame(3);
    navigate('/cardapio');
  };

  const irParaCarrinho = () => setShowCarrinho(true);
  const fecharCarrinho = () => setShowCarrinho(false);
  const limparCarrinho = () => setCarrinho([]);
  const removerItem = (id) => {
    setCarrinho(prev => prev.filter(item => item.id !== id));
  };

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
              }}
              // Passe as categorias do Firebase para o Home se necessário
              categorias={categorias}
              />
            </motion.div>
          )}

          {frame === 3 && (
            <motion.div key="frame3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Menu
                categoriaSelecionada={categoriaSelecionada}
                produtos={produtosFiltrados}
                onProdutoClick={handleProdutoClick}
                // Ajuste para usar as categorias do Firebase
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
        <button
          title="Voltar ao topo"
          className="button-to-top active"
          onClick={scrollToTop}
        >
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

// Componente principal que envolve com Router
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
