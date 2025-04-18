import React, { useState, useEffect } from 'react';
import '../styles/Frame3Produtos.css';
import { motion } from 'framer-motion';

// Skeleton para carregamento dos produtos
function ProdutoSkeleton() {
  return (
    <div className="produto-card skeleton">
      <div className="produto-img skeleton-img" />
      <div className="produto-info">
        <div className="skeleton-text" />
        <div className="skeleton-text small" />
      </div>
    </div>
  );
}

function Frame3Produtos({ categoriaSelecionada, produtos = [], onProdutoClick, categoriasOrdenadas = [], onVoltar }) {
  const [busca, setBusca] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000); // Simulação de loading
    return () => clearTimeout(timer);
  }, [produtos]);

  // Filtra os produtos com base na busca e categoria
  const categoriasAgrupadas = categoriasOrdenadas.map((catNome) => {
    const produtosDaCategoria = produtos.filter(p => p.category === catNome && p.productname.toLowerCase().includes(busca.toLowerCase()));
    return { nome: catNome, produtos: produtosDaCategoria };
  }).filter(c => c.produtos.length > 0);

  const produtosFiltrados = categoriaSelecionada
    ? produtos.filter(p => p.category === categoriaSelecionada.category && p.productname.toLowerCase().includes(busca.toLowerCase()))
    : produtos.filter(p => p.productname.toLowerCase().includes(busca.toLowerCase()));

  return (
    <motion.section
      className="frame"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
    >
      <div className="frame-title-area">
        <h1 className="frame-title">
          {categoriaSelecionada ? categoriaSelecionada.category : 'Todos os produtos'}
        </h1>
        {categoriaSelecionada && (
          <button className="btn-voltar" onClick={onVoltar}>← Voltar</button>
        )}
      </div>

      <input
        type="text"
        placeholder="Buscar produto..."
        className="campo-busca"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />

      {categoriaSelecionada ? (
        <motion.div 
          className="produtos-grid"
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.3 }}
        >
          {isLoading
            ? Array.from({ length: 6 }).map((_, idx) => <ProdutoSkeleton key={idx} />)
            : produtosFiltrados.map((produto, idx) => (
              <motion.div 
                key={idx} 
                className="produto-card" 
                onClick={() => onProdutoClick(produto)}
                whileHover={{ scale: 1.03 }}
              >
                <img 
                  src={produto.images || "/img/produtos/default.jpg"} 
                  alt={produto.productname} 
                  className="produto-img" 
                  loading="lazy" // Lazy loading das imagens
                />
                <div className="produto-info">
                  <p className="produto-nome">{produto.productname}</p>
                  <p className="produto-preco">R$ {produto.price.toFixed(2)}</p>
                </div>
              </motion.div>
            ))}
        </motion.div>
      ) : (
        categoriasAgrupadas.map((grupo, idx) => (
          <div key={idx} className="categoria-grupo">
            <h2 className="categoria-titulo">
              <span className="neufreit cor1">{grupo.nome.toUpperCase()}</span>
            </h2>
            <motion.div 
              className="carrossel-horizontal"
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.1 * idx, duration: 0.3 }}
            >
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => <ProdutoSkeleton key={i} />)
                : grupo.produtos.map((produto, i) => (
                  <motion.div 
                    key={i} 
                    className="produto-card" 
                    onClick={() => onProdutoClick(produto)}
                    whileHover={{ scale: 1.03 }}
                  >
                    <img 
                      src={produto.images || '/img/produtos/default.jpg'} 
                      alt={produto.productname} 
                      className="produto-img" 
                      loading="lazy" // Lazy loading das imagens
                    />
                    <div className="produto-info">
                      <p className="produto-nome">{produto.productname}</p>
                      <p className="produto-preco">R$ {produto.price.toFixed(2)}</p>
                    </div>
                  </motion.div>
                ))}
            </motion.div>
          </div>
        ))
      )}
    </motion.section>
  );
}

export default Frame3Produtos;
