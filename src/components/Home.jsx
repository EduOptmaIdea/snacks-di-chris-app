import React, { useEffect, useState } from 'react';
import '../styles/Home.css';
import { motion } from 'framer-motion';
import { getLocalImageUrl } from '../constants';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase.ts';

function Home({ onCategoriaClick }) {
  const [categoriasData, setCategoriasData] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log("Buscando categorias do Firestore...");
        const categoriesCollection = collection(db, "categories");
        const categorySnapshot = await getDocs(categoriesCollection);
        
        const categoriesList = categorySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            category: data.name || '',
            description: data.description || '',
            image: data.image || '',
          };
        });
        
        const processedCategories = categoriesList.map(categoria => ({
          ...categoria,
          image: getLocalImageUrl(categoria.image) // Processa a imagem aqui
        }));
        
        setCategoriasData(processedCategories);
        console.log("Categorias carregadas do Firestore:", processedCategories);
      } catch (err) {
        console.error('Erro ao carregar categorias do Firestore:', err);
        
        // Fallback para categorias do App.jsx se disponíveis
        if (window.appCategories && window.appCategories.length > 0) {
          console.log("Usando categorias do App.jsx como fallback");
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