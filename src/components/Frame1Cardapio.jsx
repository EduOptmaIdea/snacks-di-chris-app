import React, { useEffect, useState } from 'react';

function Frame1Cardapio() {
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    fetch('https://www.mockachino.com/a0c8bbde-7d0d-4a/snacksItems')
      .then((res) => res.json())
      .then((data) => {
        setCategorias(data.categories || []);
      });
  }, []);

  return (
    <section className="frame">
      <div className="center-content">
        <h1 className="frame-title">Cardápio</h1>
        <p className="frame-description">Explore nossas deliciosas opções de batatas e gostosuras!</p>
      </div>

      <div className="categorias-container">
        {categorias.map((categoria) => (
          <div key={categoria.id} className="categoria-card">
            <img
              src={`/img/categorias/${categoria.imagem}`}
              alt={categoria.nome}
              className="categoria-img"
            />
            <p className="categoria-nome">{categoria.nome}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Frame1Cardapio;

