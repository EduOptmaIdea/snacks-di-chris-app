import React from 'react';
import '../styles/Footer.css';
import { WHATSAPP_URL } from '../constants';    

const Footer = () => {
  return (
    <footer className="footer">
      {/* Seção Esquerda - Títulos com fontes especiais */}
      <div className="footer-left">
        <p className="footer-title">
          <span className="primeiraparte">SNACKS</span>
          <span className="segundaparte"> di Chris</span>
        </p>
        <p className="footer-subtitle">batataria e gostosuras</p>
      </div>

      {/* Seção Central - Desenvolvido por */}
      <div className="footer-center">
        <p className="footer-dev">Desenvolvido por Optma Idea. 2025</p>
        <a href="https://optmaidea.wixsite.com/optmaidea" target="_blank" rel="noopener noreferrer" className="footer-link">
          <img 
            src="/assets/images/icons/optma-idea.svg" 
            alt="Optma Idea" 
            className="footer-logo" 
          />
        </a>
        <p className="footer-dev">Todos os direitos reservados</p>
      </div>

      {/* Seção Direita - Redes Sociais */}
      <div className="footer-right">
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
          <img 
            src="/assets/images/icons/instagram-logo-branca.png" 
            alt="Instagram" 
            className="footer-icon" 
          />
        </a>
        <a href="https://ifood.com.br" target="_blank" rel="noopener noreferrer">
          <img 
            src="/assets/images/icons/ifood-logo-branca.png" 
            alt="iFood" 
            className="footer-icon" 
          />
        </a>
        <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
          <img 
            src="/assets/images/icons/whatsapp-logo-branca.png" 
            alt="WhatsApp" 
            className="footer-icon" 
          />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
