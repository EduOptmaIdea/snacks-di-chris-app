import React, { useState, useEffect } from 'react';
import '../styles/Menu.css';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { getLocalProductImageUrl } from '../constants';

const skeletonCount = window.innerWidth < 768 ? 4 : 6;

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

function Menu({ categoriaSelecionada, produtos = [], onProdutoClick, categoriasOrdenadas = [], onVoltar }) {
  const [busca, setBusca] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [produtos]);

  // Função para converter URL para WebP
  const getWebPImageUrl = (imagePath) => {
    if (!imagePath) return '/products/default.webp';
    
    // Verifica se já é WebP
    if (imagePath.endsWith('.webp')) return imagePath;
    
    // Converte para WebP
    const baseUrl = imagePath.split('?')[0]; // Remove query params se existirem
    return baseUrl.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  };

  const processedProducts = produtos.map(produto => ({
    ...produto,
    imageUrl: getWebPImageUrl(getLocalProductImageUrl(produto.images))
  }));

  const categoriasAgrupadas = categoriasOrdenadas.map((catNome) => {
    const produtosDaCategoria = processedProducts.filter(
      p => p.category === catNome && p.productname.toLowerCase().includes(busca.toLowerCase())
    );
    return { nome: catNome, produtos: produtosDaCategoria };
  }).filter(c => c.produtos.length > 0);

  const produtosFiltrados = categoriaSelecionada
    ? processedProducts.filter(
        p => p.category === categoriaSelecionada.category && 
        p.productname.toLowerCase().includes(busca.toLowerCase())
      )
    : processedProducts.filter(p => p.productname.toLowerCase().includes(busca.toLowerCase()));

  const renderProdutoCard = (produto) => (
    <motion.div 
      key={produto.id} 
      className="produto-card" 
      onClick={() => onProdutoClick(produto)}
      whileHover={{ scale: 1.03 }}
    >
      <div className="produto-img-container">
        <picture>
          <source srcSet={produto.imageUrl} type="image/webp" />
          <img 
            src={produto.imageUrl.replace('.webp', '.jpg')} // Fallback para JPG
            alt={produto.productname} 
            className="produto-img" 
            loading="lazy"
            onError={(e) => {
              e.target.src = '/products/default.webp';
            }}
          />
        </picture>
      </div>
      <div className="produto-info">
        <p className="produto-nome">{produto.productname}</p>
        <p className="produto-descricao">{produto.description}</p>
        <p className="produto-preco">R$ {produto.price.toFixed(2)}</p>
      </div>
    </motion.div>
  );

  return (
    <motion.section
      className="frame"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
    >
      <div className='busca-e-volta'>
        <input
          type="text"
          placeholder="Buscar produto..."
          className="campo-busca"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />      
        <button className="btn-voltar" onClick={onVoltar}>
          <span className="btn-icon"><ChevronLeft size={20} /></span> 
          <span className="btn-text">Voltar</span>
        </button>
      </div>
      
      <div className="frame-title-area">
        <h2 className="categoria-titulo">
          <span className="neufreit cor1">{categoriaSelecionada ? categoriaSelecionada.category : ''}</span>
        </h2>
      </div>

      {categoriaSelecionada ? (
        <motion.div 
          className="produtos-grid"
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.3 }}
        >
          {isLoading
            ? Array.from({ length: skeletonCount }).map((_, idx) => <ProdutoSkeleton key={idx} />)
            : produtosFiltrados.map(renderProdutoCard)}
        </motion.div>
      ) : (
        categoriasAgrupadas.map((grupo, idx) => (
          <div key={idx} className="categoria-grupo">
            <div className="categoria-titulo-container">
              <h2 className="categoria-titulo">
                <span className="neufreit cor1">{grupo.nome.toUpperCase()}</span>
              </h2>
            </div>
            <motion.div 
              className="produtos-carrossel carrossel-horizontal"
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.1 * idx, duration: 0.3 }}
            >
              {isLoading
                ? Array.from({ length: skeletonCount }).map((_, i) => <ProdutoSkeleton key={i} />)
                : grupo.produtos.map(renderProdutoCard)}
            </motion.div>
          </div>
        ))
      )}
    </motion.section>
  );
}

export default React.memo(Menu);