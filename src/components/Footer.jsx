import React, { Suspense, lazy } from 'react';
import '../styles/Footer.css';
import { WHATSAPP_URL } from '../constants';

// Componentes lazy para imagens
const OptmaLogo = lazy(() => import('./OptmaLogo'));
const SocialIcon = lazy(() => import('./SocialIcon'));

const Footer = () => {
  return (
    <footer className="footer">
      {/* Seção Esquerda */}
      <div className="footer-left">
        <p className="footer-title">
          <span className="primeiraparte">SNACKS</span>
          <span className="segundaparte"> di Chris</span>
        </p>
        <p className="footer-subtitle">Loja de gostosuras</p>
        <a 
          href="/politica-de-privacidade" 
          className="footer-privacy-link"
          aria-label="Política de Privacidade"
        >
          Política de Privacidade
        </a>
        
        {/* Novo link para área administrativa */}
        <Link 
          to="/admin" 
          className="footer-admin-link"
          aria-label="Área Administrativa"
        >
          Área restrita
        </Link>
      </div>

      {/* Seção Central */}
      <div className="footer-center">
        <p className="footer-dev">Desenvolvido por Optma Idea. 2025</p>
        <Suspense fallback={<div className="logo-placeholder" />}>
          <a 
            href="https://optmaidea.wixsite.com/optmaidea" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="footer-link"
          >
            <OptmaLogo />
          </a>
        </Suspense>
        <p className="footer-dev">Todos os direitos reservados</p>
      </div>

      {/* Seção Direita */}
      <div className="footer-right">
        <Suspense fallback={<div className="icon-placeholder" />}>
          <SocialIcon 
            url="https://instagram.com" 
            platform="instagram" 
            alt="Instagram" 
          />
          <SocialIcon 
            url="https://ifood.com.br" 
            platform="ifood" 
            alt="iFood" 
          />
          <SocialIcon 
            url={WHATSAPP_URL} 
            platform="whatsapp" 
            alt="WhatsApp" 
          />
        </Suspense>
      </div>
    </footer>
  );
};

export default React.memo(Footer);