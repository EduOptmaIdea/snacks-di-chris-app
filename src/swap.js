import React, { useState, useEffect } from 'react';
import './styles/App.css';
import { AnimatePresence, motion } from 'framer-motion';
import Frame1Cardapio from './components/Frame1Cardapio';
import Frame2Categorias from './components/Frame2Categorias';
import Frame3Produtos from './components/Frame3Produtos';
import Frame5DetalhesProduto from './components/Frame5DetalhesProduto';
import CarrinhoFrame from './components/CarrinhoFrame';

function App() {
  const [frame, setFrame] = useState(1);
  const [categorias, setCategorias] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [ingredientes, setIngredientes] = useState([]);
  const [alergenicos, setAlergenicos] = useState([]);
  const [carrinho, setCarrinho] = useState([]); // Estado para o carrinho
  const [showCarrinho, setShowCarrinho] = useState(false); // Estado para controlar a exibição do carrinho

  useEffect(() => {
    fetch('https://www.mockachino.com/a0c8bbde-7d0d-4a/snacks')
      .then((res) => res.json())
      .then((data) => {
        setCategorias(data.Categorias || []);
        setProdutos(data.Produtos || []);
        setIngredientes(data.Ingredientes || []);
        setAlergenicos(data.Alergenicos || []);
      });
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [frame]);

  const handleMenuClick = (targetFrame) => {
    setCategoriaSelecionada(null);
    setFrame(targetFrame);
  };

  const handleProdutoClick = (produto) => {
    setProdutoSelecionado(produto);
    setFrame(5); // Muda para o Frame5
  };

  const closeProdutoDetalhes = () => {
    setProdutoSelecionado(null);
    setFrame(3); // Volta para o Frame3 após fechar os detalhes do produto
  };

  const openWhatsApp = () => {
    window.open('https://wa.me/5562999948?text=Ol%C3%A1%2C%20gostaria%20de%20falar%20com%20a%20_Snack%20di%20Chris_', '_blank');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  // Função para adicionar produto ao carrinho
  const adicionarAoCarrinho = (produto) => {
    setCarrinho((prevCarrinho) => {
      const produtoExistente = prevCarrinho.find(item => item.id === produto.id);
      if (produtoExistente) {
        return prevCarrinho.map(item => 
          item.id === produto.id 
          ? { ...item, quantidade: item.quantidade + produto.quantidade } 
          : item
        );
      }
      return [...prevCarrinho, produto];
    });
  };

  // Função para abrir o modal do carrinho
  const abrirCarrinho = () => setShowCarrinho(true);

  // Função para fechar o modal do carrinho
  const fecharCarrinho = () => setShowCarrinho(false);

  return (
    <div className="App">
      <header>
        <div className="header-content">
          <img src="/img/logo.svg" alt="Logo" className="logo" style={{ height: '100px' }} />
          <nav className="menu">
            <button className={`menu-item ${frame === 1 ? 'active' : ''}`} onClick={() => handleMenuClick(1)}>Cardápio</button>
            <button className={`menu-item ${frame === 2 ? 'active' : ''}`} onClick={() => handleMenuClick(2)}>Categorias</button>
            <button className={`menu-item ${frame === 3 ? 'active' : ''}`} onClick={() => handleMenuClick(3)}>Todos os produtos</button>
            <a className="menu-item" href="https://www.ifood.com.br/inicio" target="_blank" rel="noopener noreferrer">Ifood</a>
            <button className="menu-item" onClick={openWhatsApp}>Fale conosco</button>
          </nav>

          {/* Botão de carrinho no cabeçalho */}
          <div className="cart-container">
            <button className="cart-button" onClick={abrirCarrinho}>
              <img src="/img/icons/icone-cesta.svg" alt="Carrinho de compras" className="carrinho-grande" style={{ height: '100px' }} />
              <span>{carrinho.length}</span> {/* Mostra o número de itens no carrinho */}
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

      {/* Modal do carrinho */}
      {showCarrinho && <CarrinhoFrame items={carrinho} onClose={fecharCarrinho} />}

      {/* Exibição do produto detalhado */}
      {produtoSelecionado && frame === 5 && (
        <Frame5DetalhesProduto
          produto={produtoDetalhado}
          onClose={closeProdutoDetalhes}
          adicionarAoCarrinho={adicionarAoCarrinho} // Passa a função para adicionar ao carrinho
        />
      )}

      <button className="voltar-topo" onClick={scrollToTop}>Voltar ao topo</button>

      <footer className="footer">
        <div className="footer-left">
          <p className="footer-title">SNACKS di Chris</p>
          <p className="footer-subtitle">batataria e gostosuras</p>
        </div>
        <div className="footer-center">
          <p className="footer-dev">desenvolvido por</p>
          <a href="https://optmaidea.wixsite.com/optmaidea" target="_blank" rel="noopener noreferrer">
            <img src="/img/icons/optma-idea.svg" alt="Optma Idea" className="footer-logo" />
            <p className="footer-dev-name">2025</p>
          </a>
        </div>
        <div className="footer-right">
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
            <img src="/img/icons/instagram-logo-branca.png" alt="Instagram" className="footer-icon" />
          </a>
          <a href="https://ifood.com.br" target="_blank" rel="noopener noreferrer">
            <img src="/img/icons/ifood-logo-branca.png" alt="iFood" className="footer-icon" />
          </a>
          <a href="https://wa.me/5562999948?text=Ol%C3%A1%2C%20gostaria%20de%20falar%20com%20a%20_Snack%20di%20Chris_" target="_blank" rel="noopener noreferrer">
            <img src="/img/icons/whatsapp-logo-branca.png" alt="WhatsApp" className="footer-icon" />
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
