import React, { Suspense, lazy } from 'react';
import '../styles/Header.css';
import { House, ShoppingBag } from 'lucide-react';
import MediaQuery from 'react-responsive';

// Carrega a imagem de forma lazy
const Logo = lazy(() => import('./Logo'));

const Header = ({ frame, handleMenuClick, openWhatsApp, irParaCarrinho, carrinho }) => {
  return (
    <header>
      <div className="header-content">
        <Suspense fallback={<div className="logo-placeholder" />}>
          <Logo />
        </Suspense>
        
        <nav className="menu">
          <button className={`menu-item ${frame === 1 ? 'active' : ''}`} onClick={() => handleMenuClick(1)}>
            <House style={{display: 'inline-block'}} size={22} /> Início
          </button>
          <button className={`menu-item ${frame === 3 ? 'active' : ''}`} onClick={() => handleMenuClick(3)}>
            Cardápio
          </button>
          <a className="menu-item" href="https://www.ifood.com.br/inicio" target="_blank" rel="noopener noreferrer">
            Ifood
          </a>
          <button className="menu-item" onClick={openWhatsApp}>
            Fale conosco
          </button>
        </nav>
        
        <div className="cart-container">
          <button 
            className="cart-button" 
            onClick={irParaCarrinho}
            aria-label={`Carrinho com ${carrinho.length} itens`}
          >
            <MediaQuery query="(max-width: 768px)">
              <ShoppingBag size={20} color='#A9373E' />
            </MediaQuery>
            <MediaQuery query="(min-width: 769px)">
              <ShoppingBag size={30} color='#A9373E' />
            </MediaQuery>
            <span className="carrinho-length" aria-hidden="true">
              {carrinho.length}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default React.memo(Header);