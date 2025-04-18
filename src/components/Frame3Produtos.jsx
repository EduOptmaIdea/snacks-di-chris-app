import React from 'react';
import '../styles/Frame3Produtos.css';
import { motion } from 'framer-motion';

function Frame3Produtos({ categoriaSelecionada, produtos = [], onProdutoClick, categoriasOrdenadas = [], onVoltar }) {
  const categoriasAgrupadas = categoriasOrdenadas.map((catNome) => {
    const produtosDaCategoria = produtos.filter(p => p.categoria === catNome);
    return { nome: catNome, produtos: produtosDaCategoria };
  }).filter(c => c.produtos.length > 0);

  const produtosFiltrados = categoriaSelecionada
    ? produtos.filter(p => p.categoria === categoriaSelecionada.categoria)
    : produtos;

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
          {categoriaSelecionada ? categoriaSelecionada.categoria : 'Todos os produtos'}
        </h1>
        {categoriaSelecionada && (
          <button className="btn-voltar" onClick={onVoltar}>← Voltar</button>
        )}
      </div>
      {categoriaSelecionada ? (
        <motion.div 
          className="produtos-grid"
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.3 }}
        >
          {produtosFiltrados.map((produto, idx) => (
            <motion.div 
              key={idx} 
              className="produto-card" 
              onClick={() => onProdutoClick(produto)}
              whileHover={{ scale: 1.03 }}
            >
              <img src={products.images || "/assets/images/products/default.jpg"} alt={products.productname} className="produto-img" />
              <div className="produto-info">
                <p className="produto-nome">{products.productname}</p>
                <p className="produto-preco">R$ {products.price.toFixed(2)}</p>
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
              className="produtos-grid"
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.1 * idx, duration: 0.3 }}
            >
              {grupo.produtos.map((produto, i) => (
                <motion.div 
                  key={i} 
                  className="produto-card" 
                  onClick={() => onProdutoClick(produto)}
                  whileHover={{ scale: 1.03 }}
                >
                  <img src={produto.imagens || '/img/produtos/default.jpg'} alt={produto.nome} className="produto-img" />
                  <div className="produto-info">
                    <p className="produto-nome">{produto.nome}</p>
                    <p className="produto-preco">R$ {produto.preco.toFixed(2)}</p>
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
