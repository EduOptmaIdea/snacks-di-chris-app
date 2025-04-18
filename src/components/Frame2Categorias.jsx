import React from 'react';

function Frame2Categorias({ categorias, onCategoriaClick }) {
  return (
    <section className="frame">
      <h1 className="frame-title">Categorias</h1>
      <div className="categorias-grid">
        {categorias.map((cat, idx) => (
          <div key={idx} className="categoria-card" onClick={() => onCategoriaClick(cat)}>
            <img
              src={cat.image || 'assets/images/categories/default.jpg'}
              alt={cat.categoria || 'Categoria'}
              className="categoria-img"
            />
            <div className="categoria-info">
              <p className="categoria-nome neufreit cor1">{cat.category || 'Categoria sem nome'}</p>
              <p className="categoria-descricao neufreit cor3">{cat.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Frame2Categorias;
