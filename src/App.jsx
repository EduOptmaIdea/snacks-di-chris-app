import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import './styles/App.css';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './components/Header';
import Footer from './components/Footer';
import { API_URL, WHATSAPP_URL } from './constants';
import { ChevronsUp } from 'lucide-react';

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

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        setCategorias(data.categories || []);
        setProducts(data.products || []);
      });
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

  const ordemCategorias = [
    'Batata recheada',
    'Batata Rosti',
    'Mandioca Rosti',
    'Sobremesas',
    'Bebidas'
  ];

  const produtosFiltrados = categoriaSelecionada
    ? products.filter(p => p.category === categoriaSelecionada.category)
    : ordemCategorias.flatMap(cat => products.filter(p => p.category === cat));

  const produtoDetalhado = produtoSelecionado
    ? {
        ...produtoSelecionado,
        ingredientesDetalhados: produtoSelecionado.ingredients
          ? produtoSelecionado.ingredients.split(',').map(i => i.trim())
          : [],
        alergenicosDetalhados: produtoSelecionado['allergenic-agents']
          ? produtoSelecionado['allergenic-agents'].split(',').map(a => a.trim())
          : []
      }
    : null;

  const adicionarAoCarrinho = (novoItem) => {
    setCarrinho((carrinhoAtual) => {
      const existente = carrinhoAtual.find(item =>
        item.id === novoItem.id &&
        item.comentario === novoItem.comentario
      );
    
      if (existente) {
        return carrinhoAtual.map(item =>
          item === existente
            ? { ...item, quantidade: item.quantidade + novoItem.quantidade }
            : item
        );
      } else {
        return [...carrinhoAtual, { ...novoItem }];
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
              />
            </motion.div>
          )}
          
          {frame === 3 && (
            <motion.div key="frame3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Menu
                categoriaSelecionada={categoriaSelecionada}
                produtos={produtosFiltrados}
                onProdutoClick={handleProdutoClick}
                categoriasOrdenadas={ordemCategorias}
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