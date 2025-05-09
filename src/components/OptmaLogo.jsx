import React from 'react';
import optmaLogo from '@icons/optma-idea.svg'; // Usando o mesmo alias que funciona no header

const OptmaLogo = () => (
  <img 
    src={optmaLogo} 
    alt="Optma Idea"
    className="footer-logo"
    width="80"
    height="40"
    loading="lazy"
  />
);

export default OptmaLogo;