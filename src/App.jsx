import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import './styles/App.css';
import './styles/fonts.css';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './components/Header';
import Footer from './components/Footer';
import { API_URL, WHATSAPP_URL } from './constants'; // Mantenha se ainda usar para outras coisas
import { ChevronsUp } from 'lucide-react';

import { db } from './firebase';
import { collection, getDocs, query, orderBy } from "firebase/firestore";

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

  // Lógica para buscar produtos do Firebase (Firestore)
  useEffect(() => {
    const fetchFirebaseProducts = async () => {
      try {
        console.log("Buscando produtos do Firestore...");
        const productsCollection = collection(db, "products"); // "products" é o nome da coleção no Firestore
        const productSnapshot = await getDocs(productsCollection);
        
        const productList = productSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            productname: data.productName || '',
            description: data.description || '',
            price: data.price || 0,
            image: data.image || '',
            imagePath: data.imagePath || '',
            categoria: data.categoryRef || '',
            available: data.available !== undefined ? data.available : true,
            ingredientes: data.ingredientRefs || [],
            alergenicos: data.allergenicAgentRefs || []
          };
        });
        
        // Filtrar apenas produtos disponíveis
        const availableProducts = productList.filter(product => product.available);
        
        setProducts(productList); // Ou use availableProducts se quiser mostrar apenas disponíveis
        console.log("Produtos carregados do Firestore:", productList);

        // Extrair categorias únicas dos produtos
        const uniqueCategories = [...new Set(productList.map(p => p.categoria))];
        setCategorias(uniqueCategories.map(catName => ({ 
          category: catName, 
          name: catName 
        })));
        console.log("Categorias definidas a partir do Firestore:", uniqueCategories);

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
    // Exemplo de como você poderia registrar uma visualização de produto no Firebase
    // logProductView(produto.id); // Você precisaria criar essa função, similar ao firebase_reporting_details.md
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

  // Ajuste aqui se as categorias do Firebase tiverem uma estrutura diferente
  const produtosFiltrados = categoriaSelecionada
    ? products.filter(p => p.categoria === categoriaSelecionada.category) // Se categoriaSelecionada.category for o nome da categoria
    : ordemCategorias.flatMap(catName => products.filter(p => p.categoria === catName));

  const produtoDetalhado = produtoSelecionado
    ? {
      ...produtoSelecionado,
      // Adapte os campos abaixo para corresponderem à estrutura do seu produto no Firebase
      ingredientesDetalhados: produtoSelecionado.ingredientes // Supondo que você tenha um campo 'ingredientes' (array ou string)
        ? (Array.isArray(produtoSelecionado.ingredientes) ? produtoSelecionado.ingredientes : produtoSelecionado.ingredientes.split(',').map(i => i.trim()))
        : [],
      alergenicosDetalhados: produtoSelecionado.alergenicos // Supondo um campo 'alergenicos'
        ? (Array.isArray(produtoSelecionado.alergenicos) ? produtoSelecionado.alergenicos : produtoSelecionado.alergenicos.split(',').map(a => a.trim()))
        : []
    }
    : null;

  const adicionarAoCarrinho = (novoItem) => {
    // Verificar se o produto está disponível antes de adicionar ao carrinho
    if (novoItem.available === false) {
      console.log("Produto indisponível não pode ser adicionado ao carrinho:", novoItem);
      return; // Não adiciona ao carrinho se o produto estiver indisponível
    }
    
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
              // Passe as categorias do Firebase para o Home se necessário
              // categorias={categorias} 
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
                categoriasFromFirebase={categorias} // Novo prop, ou adapte 'categoriasOrdenadas'
                categoriasOrdenadas={ordemCategorias} // Mantenha se a ordem for manual, ou derive do Firebase
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