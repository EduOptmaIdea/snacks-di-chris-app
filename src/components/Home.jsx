import React, { useEffect, useState } from 'react';
import '../styles/Home.css';
import { motion } from 'framer-motion';
import { API_URL, getLocalImageUrl } from '../constants';

function Home({ onCategoriaClick }) {
  const [categoriasData, setCategoriasData] = useState([]);

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        const processedCategories = (data.categories || []).map(categoria => ({
          ...categoria,
          image: getLocalImageUrl(categoria.image) // Processa a imagem aqui
        }));
        setCategoriasData(processedCategories);
      })
      .catch((err) => console.error('Erro ao carregar categorias:', err));
  }, []);

  return (
    <div className="categorias-vertical-container">
      {categoriasData.map((categoria, index) => (
        <motion.div 
          key={categoria.id}
          className="categoria-vertical"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <div 
            className="imagem-container-vertical" 
            onClick={() => onCategoriaClick(categoria)}
          >
            <img
              src={categoria.image}
              alt={categoria.category}
              className="imagem-vertical"
              onError={(e) => {
                e.target.src = '/categories/default.jpg'; // Fallback
              }}
            />
            <div className="texto-overlay-vertical">
              <div className="barra-titulo-container">
                <div className="barra-vertical"></div>
                <h2 className="titulo-categoria">{categoria.category}</h2>
              </div>
              <p className="descricao-categoria">{categoria.description}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default Home;