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

function Menu({ categoriaSelecionada, produtos = [], onProdutoClick, categoriasFromFirebase = [], categoriasOrdenadas = [], onVoltar }) {
  const [busca, setBusca] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [produtos]);

  // Função para converter URL para WebP
  const getWebPImageUrl = (imagePath) => {
    if (!imagePath) return '/default.webp';
    
    // Se for uma URL do Firebase Storage, use-a diretamente
    if (imagePath && imagePath.includes && imagePath.includes('firebasestorage.googleapis.com')) return imagePath;

    // Verifica se já é WebP
    if (imagePath && imagePath.endsWith && imagePath.endsWith('.webp')) return imagePath;

    // Converte para WebP
    const baseUrl = imagePath && imagePath.split ? imagePath.split('?')[0] : imagePath; // Remove query params se existirem
    return baseUrl && baseUrl.replace ? baseUrl.replace(/\.(jpg|jpeg|png)$/i, '.webp') : '/products/default.webp';
  };

  // Processa produtos para garantir compatibilidade com Firebase
  const processedProducts = produtos.map(produto => {
    // Garantir que sempre tenhamos um nome de produto válido
    // IMPORTANTE: Verificar todos os possíveis campos de nome, incluindo productName (com N maiúsculo)
    const nomeProduto = produto.productName || produto.productname || produto.name || produto.nome || "Produto";
    
    const processedProduct = {
      ...produto,
      id: produto.id || Math.random().toString(36).substring(2),
      productname: nomeProduto,
      name: nomeProduto, // Garantir que ambas as propriedades estejam presentes
      nome: nomeProduto, // Garantir que ambas as propriedades estejam presentes
      description: produto.description || '',
      price: produto.price || produto.preco || 0,
      preco: produto.price || produto.preco || 0, // Garantir que ambas as propriedades estejam presentes
      category: produto.category || produto.categoria || '',
      categoria: produto.category || produto.categoria || '',
      imageUrl: produto.image 
        ? getWebPImageUrl(produto.image) 
        : getWebPImageUrl(getLocalProductImageUrl(produto.imagePath || produto.images))
    };
    
    return processedProduct;
  });

  // Ordem fixa das categorias conforme especificado
  const ordemFixaCategorias = [
    'Batata recheada',
    'Batata Rosti',
    'Mandioca Rosti',
    'Sobremesas',
    'Bebidas'
  ];

  // Usar categorias do Firebase se disponíveis, caso contrário usar as ordenadas
  let categoriasParaExibir = categoriasFromFirebase.length > 0 
    ? [...categoriasFromFirebase] 
    : ordemFixaCategorias.map(cat => ({ category: cat, name: cat }));

  // Ordenar categorias conforme a ordem fixa
  categoriasParaExibir.sort((a, b) => {
    const indexA = ordemFixaCategorias.indexOf(a.category);
    const indexB = ordemFixaCategorias.indexOf(b.category);
    
    // Se ambas as categorias estiverem na lista fixa, use a ordem da lista
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }
    
    // Se apenas uma estiver na lista fixa, priorize-a
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    
    // Se nenhuma estiver na lista fixa, mantenha a ordem original
    return 0;
  });

  // Filtrar produtos por busca
  const produtosFiltradosPorBusca = processedProducts.filter(p => 
    p.productname.toLowerCase().includes(busca.toLowerCase())
  );

  // Agrupar produtos por categoria
  const categoriasAgrupadas = categoriasParaExibir.map((cat) => {
    const catName = cat.category || cat.name;
    const produtosDaCategoria = produtosFiltradosPorBusca.filter(
      p => (p.category === catName || p.categoria === catName)
    );
    return { nome: catName, produtos: produtosDaCategoria };
  }).filter(c => c.produtos.length > 0);

  // Produtos filtrados para quando uma categoria específica é selecionada
  const produtosFiltrados = categoriaSelecionada
    ? produtosFiltradosPorBusca.filter(
        p => (p.category === categoriaSelecionada.category || p.categoria === categoriaSelecionada.category) ||
             (categoriaSelecionada.id && p.categoryId === categoriaSelecionada.id)
      )
    : produtosFiltradosPorBusca;

  const renderProdutoCard = (produto) => {
    const isIndisponivel = produto.available === false;

    return (
      <motion.div
        key={produto.id}
        className={`produto-card relative group cursor-pointer ${
          isIndisponivel ? 'opacity-60' : ''
        }`}
        onClick={isIndisponivel ? undefined : () => onProdutoClick(produto)}
        whileHover={isIndisponivel ? {} : { scale: 1.03 }}
        style={{ pointerEvents: isIndisponivel ? 'none' : 'auto' }}
      >
        {isIndisponivel && (
          <div className="overlay-indisponivel">
            <span className="label-indisponivel">Indisponível no momento</span>
          </div>
        )}

        <div className="produto-img-container">
          <picture>
            <source srcSet={produto.imageUrl} type="image/webp" />
            <img
              src={produto.imageUrl && produto.imageUrl.replace ? produto.imageUrl.replace('.webp', '.jpg') : '/default.webp'} // Fallback para JPG
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
          <p className="produto-preco">R$ {typeof produto.price === 'number' ? produto.price.toFixed(2) : parseFloat(produto.price || 0).toFixed(2)}</p>
        </div>
      </motion.div>
    );
  };

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

      {categoriaSelecionada && (
        <div className="frame-title-area">
          <h2 className="categoria-titulo">
            <span className="neufreit cor1">{categoriaSelecionada.category || categoriaSelecionada.name || "Produtos"}</span>
          </h2>
        </div>
      )}

      {categoriaSelecionada ? (
        <motion.div
          className="produtos-grid"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {isLoading
            ? Array.from({ length: skeletonCount }).map((_, idx) => <ProdutoSkeleton key={idx} />)
            : produtosFiltrados.length > 0 
              ? produtosFiltrados.map(renderProdutoCard)
              : <div className="sem-produtos">Nenhum produto encontrado nesta categoria.</div>
          }
        </motion.div>
      ) : (
        categoriasAgrupadas.length > 0 ? (
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
        ) : (
          <div className="sem-produtos">Nenhum produto encontrado. Tente outra busca.</div>
        )
      )}
    </motion.section>
  );
}

export default React.memo(Menu);
