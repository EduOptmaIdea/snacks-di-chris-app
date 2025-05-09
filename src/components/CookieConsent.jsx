import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/CookieConsent.css';
import { PRIVACY_POLICY_URL } from '../constants';

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (consent === null) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem('cookieConsent', 'rejected');
    setVisible(false);
    // Aqui você pode adicionar lógica para remover cookies não essenciais
  };

  if (!visible) return null;

  return (
    <div className="cookie-consent-banner">
      <div className="cookie-consent-content">
        <p>
            Nós utilizamos cookies para melhorar sua experiência. Ao continuar navegando, você concorda com nossa 
            <Link to={PRIVACY_POLICY_URL} target="_blank" rel="noopener noreferrer">
                Política de Privacidade
            </Link>
        </p>
        <div className="cookie-consent-buttons">
          <button className="cookie-reject" onClick={handleReject}>
            Rejeitar
          </button>
          <button className="cookie-accept" onClick={handleAccept}>
            Aceitar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;