import React, { useState, useEffect, useCallback } from 'react';
import './styles/App.css';
import { AnimatePresence, motion } from 'framer-motion';
import Frame1Cardapio from './components/Frame1Cardapio';
import Frame2Categorias from './components/Frame2Categorias';
import Header  from './components/Header';  // Importando o Header
import Footer from './components/Footer';
import Frame3Produtos from './components/Frame3Produtos';
import Frame5DetalhesProduto from './components/Frame5DetalhesProduto';
import CarrinhoFrame from './components/CarrinhoFrame';
import { API_URL, WHATSAPP_URL } from './constants'; // Importando constantes de URL


// Função throttle movida para fora do componente
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

function App() {
  const [frame, setFrame] = useState(1);
  const [categorias, setCategorias] = useState([]);
  const [products, setProducts] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [carrinho, setCarrinho] = useState([]);
  const [showCarrinho, setShowCarrinho] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

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

  const handleMenuClick = (targetFrame) => {
    setCategoriaSelecionada(null);
    setFrame(targetFrame);
  };

  const handleProdutoClick = (produto) => {
    setProdutoSelecionado(produto);
    setFrame(5);
  };

  const closeProdutoDetalhes = () => {
    setProdutoSelecionado(null);
    setFrame(3);
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
        ingredientesDetalhados: ingredientes.filter(ing => produtoSelecionado.ingredientes_ids?.includes(ing.id)),
        alergenicosDetalhados: alergenicos.filter(al => produtoSelecionado.alergicos_ids?.includes(al.id))
      }
    : null;

  const adicionarAoCarrinho = (produto, quantidade) => {
    setCarrinho((prevCarrinho) => {
      const produtoExistente = prevCarrinho.find(item => item.id === produto.id);
      if (produtoExistente) {
        return prevCarrinho.map(item => 
          item.id === produto.id 
          ? { ...item, quantidade: item.quantidade + quantidade } 
          : item
        );
      }
      return [...prevCarrinho, { ...produto, quantidade }];
    });
  };
    
  const abrirCarrinho = () => setShowCarrinho(true);
  const fecharCarrinho = () => setShowCarrinho(false);
  const limparCarrinho = () => setCarrinho([]);
  const removerItem = (id) => {
    setCarrinho(prev => prev.filter(item => item.id !== id));
  };

  const voltarParaProdutos = () => {
    setCategoriaSelecionada(null);
    setProdutoSelecionado(null);
    setFrame(3);
  };

  return (
    <div className="App">
      <Header
        frame={frame}
        handleMenuClick={handleMenuClick}
        openWhatsApp={openWhatsApp}
        abrirCarrinho={abrirCarrinho}
        carrinho={carrinho}
      />

      <AnimatePresence mode="wait">
        {frame === 1 && (
          <motion.div key="frame1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Frame1Cardapio categorias={categorias} />
          </motion.div>
        )}
        {frame === 2 && (
          <motion.div key="frame2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Frame2Categorias
              categorias={categorias}
              onCategoriaClick={(categoria) => {
                setCategoriaSelecionada(categoria);
                setFrame(3);
              }}
            />
          </motion.div>
        )}
        {frame === 3 && (
          <motion.div key="frame3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Frame3Produtos
              categoriaSelecionada={categoriaSelecionada}
              products={produtosFiltrados}
              onProdutoClick={handleProdutoClick}
              categoriasOrdenadas={ordemCategorias}
              onVoltar={() => {
                setCategoriaSelecionada(null);
                setFrame(2);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {showCarrinho && (
        <CarrinhoFrame
          items={carrinho}
          onClose={fecharCarrinho}
          onRemoveItem={removerItem}
          onClearCart={limparCarrinho}
          onVoltarProdutos={voltarParaProdutos}
        />
      )}

      {produtoSelecionado && frame === 5 && (
        <Frame5DetalhesProduto
          produto={produtoDetalhado}
          onClose={closeProdutoDetalhes}
          adicionarAoCarrinho={adicionarAoCarrinho}
          abrirCarrinho={abrirCarrinho}
        />
      )}

      {/* Botão Voltar ao Topo com estilos inline para garantia */}

      {showScrollButton && (
        <button 
        className="button-to-top active"
        title="Voltar ao topo"
        onClick={scrollToTop}
      >
        <div>Voltar<br />ao topo</div>
        <span className="arrow"></span>
      </button>
      )}
  <Footer></Footer>
    </div>
  );
}

export default App;