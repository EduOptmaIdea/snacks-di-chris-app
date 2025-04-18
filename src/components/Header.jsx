// src/components/Header.jsx
import React from 'react';
import '../styles/Header.css'; // se quiser separar estilos também

const Header = ({ frame, handleMenuClick, openWhatsApp, abrirCarrinho, carrinho }) => {
  return (
    <header>
      <div className="header-content">
        <img src="assets/images/logo.svg" alt="Logo" className="logo" style={{ height: '100px' }} />
        <nav className="menu">
          <button className={`menu-item ${frame === 1 ? 'active' : ''}`} onClick={() => handleMenuClick(1)}>Cardápio</button>
          <button className={`menu-item ${frame === 2 ? 'active' : ''}`} onClick={() => handleMenuClick(2)}>Categorias</button>
          <button className={`menu-item ${frame === 3 ? 'active' : ''}`} onClick={() => handleMenuClick(3)}>Todos os produtos</button>
          <a className="menu-item" href="https://www.ifood.com.br/inicio" target="_blank" rel="noopener noreferrer">Ifood</a>
          <button className="menu-item" onClick={openWhatsApp}>Fale conosco</button>
        </nav>

        <div className="cart-container">
          <button className="cart-button" onClick={abrirCarrinho}>
            <img src="assets/images/icons/icone-cesta.svg" alt="Carrinho de compras" className="carrinho-grande" style={{ height: '100px' }} />
            <span>{carrinho.reduce((total, item) => total + item.quantidade, 0)}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
