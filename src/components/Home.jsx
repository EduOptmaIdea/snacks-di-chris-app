import React, { useEffect, useState } from 'react';
import '../styles/Home.css';
import { motion } from 'framer-motion';
import { getLocalImageUrl } from '../constants';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase.ts';

function Home({ onCategoriaClick }) {
  const [categoriasData, setCategoriasData] = useState([]);

  // Ordem fixa das categorias conforme especificado
  const ordemFixaCategorias = [
    'Batata recheada',
    'Batata Rosti',
    'Mandioca Rosti',
    'Sobremesas',
    'Bebidas'
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesCollection = collection(db, "categories");
        const categorySnapshot = await getDocs(categoriesCollection);
        
        const categoriesList = categorySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            category: data.category || data.name || '',
            description: data.description || '',
            image: data.image || '',
          };
        });
        
        const processedCategories = categoriesList.map(categoria => ({
          ...categoria,
          image: getLocalImageUrl(categoria.image) // Processa a imagem aqui
        }));
        
        // Ordenar categorias conforme a ordem fixa
        const sortedCategories = [...processedCategories].sort((a, b) => {
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
        
        setCategoriasData(sortedCategories);
      } catch (err) {
        console.error('Erro ao carregar categorias do Firestore:', err);
        
        // Fallback para categorias do App.jsx se disponíveis
        if (window.appCategories && window.appCategories.length > 0) {
          setCategoriasData(window.appCategories);
        }
      }
    };
    
    fetchCategories();
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
