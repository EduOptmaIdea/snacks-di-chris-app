import React, { useState, useEffect, useCallback } from 'react';
import './styles/App.css';
import { AnimatePresence, motion } from 'framer-motion';
import Frame1Cardapio from './components/Frame1Cardapio';
import Frame2Categorias from './components/Frame2Categorias';
import Frame3Produtos from './components/Frame3Produtos';
import Frame5DetalhesProduto from './components/Frame5DetalhesProduto';
import CarrinhoFrame from './components/CarrinhoFrame';

// Função throttle movida para fora do componente
const throttle = (func, limit) => {
  let lastFunc;
  let lastRan;
  return function() {
    const context = this;
    const args = arguments;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function() {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
};

function App() {
  const [frame, setFrame] = useState(1);
  const [categorias, setCategorias] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [ingredientes, setIngredientes] = useState([]);
  const [alergenicos, setAlergenicos] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const [showCarrinho, setShowCarrinho] = useState(false);  

  useEffect(() => {
    fetch('https://www.mockachino.com/a0c8bbde-7d0d-4a/snacksItems')
      .then((res) => res.json())
      .then((data) => {
        setCategorias(data.categories || []);
        setProdutos(data.products || []);
        setIngredientes(data.Ingredientes || []);
        setAlergenicos(data.Alergenicos || []);
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

  // Removed duplicate scrollToTop function

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
    window.open('https://wa.me/5562999948?text=Ol%C3%A1%2C%20gostaria%20de%20falar%20com%20a%20_Snack%20di%20Chris_', '_blank');
  };

  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.scrollY > 300);
    };

    const throttledScroll = throttle(handleScroll, 100);
    window.addEventListener('scroll', throttledScroll);
    return () => window.removeEventListener('scroll', throttledScroll);
  }, []);

  const ordemCategorias = [
    'Batata recheada',
    'Batata Rosti',
    'Mandioca Rosti',
    'Sobremesas',
    'Bebidas'
  ];

  const produtosFiltrados = categoriaSelecionada
    ? produtos.filter(p => p.categoria === categoriaSelecionada.categoria)
    : ordemCategorias.flatMap(cat => produtos.filter(p => p.categoria === cat));

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

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };
    
    // Adiciona throttle para melhor performance
    const throttledScroll = throttle(handleScroll, 200);
    window.addEventListener('scroll', throttledScroll);
    
    return () => window.removeEventListener('scroll', throttledScroll);
  }, []);
    
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
      <header>
        <div className="header-content">
          <img src="assets/images/logo.svg" alt="Logo" className="logo" style={{ height: '100px' }} />
          <nav className="menu">
            <button className={`menu-item ${frame === 1 ? 'active' : ''}`} onClick={() => handleMenuClick(1)}>Cardápio</button>
            <button className={`menu-item ${frame === 2 ? 'active' : ''}`} onClick={() => handleMenuClick(2)}>Categorias</button>
            <button className={`menu-item ${frame === 3 ? 'active' : ''}`} onClick={() => handleMenuClick(3)}>Todos os produtos</button>
            <a className="menu-item" href="https://www.ifood.com.br/inicio" target="_blank" rel="noopener noreferrer">Ifood</a>
            <button className="menu-item" onClick={openWhatsApp}>Fale conosco</button>
          </nav>

          <div className="cart-container">
            <button className="cart-button" onClick={abrirCarrinho}>
              <img src="assets/images/icons/icone-cesta.svg" alt="Carrinho de compras" className="carrinho-grande" style={{ height: '100px' }} />
              <span>{carrinho.length}</span>
            </button>
          </div>
        </div>
      </header>

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
              produtos={produtosFiltrados}
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

      {/* Botão Voltar ao Topo */}
      {showScrollButton && (
        <button 
          alt="Voltar ao topo" 
          title="Voltar ao topo" 
          className="button-to-top"
          onClick={scrollToTop}
        >
          <div>Voltar<br />ao Topo</div>
          <span className="arrow"></span>
        </button>
      )}

      <footer className="footer">
        {/* Seção Esquerda - Títulos com fontes especiais */}
        <div className="footer-left">
          <p className="footer-title"><span className="primeiraparte">SNACKS</span> <span className="segundaparte"> di Chris</span></p>
          <p className="footer-subtitle">batataria e gostosuras</p>
        </div>
        
        {/* Seção Central - Desenvolvido por */}
        <div className="footer-center">
          <p className="footer-dev">desenvolvido por:</p>
          <a href="https://optmaidea.wixsite.com/optmaidea" target="_blank" rel="noopener noreferrer" className="footer-link">
            <img 
              src="/assets/images/icons/optma-idea.svg" 
              alt="Optma Idea" 
              className="footer-logo" 
            />
          </a>
          <p className="footer-dev-name">2025</p>
        </div>
        
        {/* Seção Direita - Redes Sociais */}
        <div className="footer-right">
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
            <img 
              src="/assets/images/icons/instagram-logo-branca.png" 
              alt="Instagram" 
              className="footer-icon" 
            />
          </a>
          <a href="https://ifood.com.br" target="_blank" rel="noopener noreferrer">
            <img 
              src="/assets/images/icons/ifood-logo-branca.png" 
              alt="iFood" 
              className="footer-icon" 
            />
          </a>
          <a href="https://wa.me/5562999948?text=Ol%C3%A1%2C%20gostaria%20de%20falar%20com%20a%20_Snack%20di%20Chris_" 
            target="_blank" 
            rel="noopener noreferrer">
            <img 
              src="/assets/images/icons/whatsapp-logo-branca.png" 
              alt="WhatsApp" 
              className="footer-icon" 
            />
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;