import React from 'react';
import logo from '@icons/logo.min.svg'; // Usando o alias configurado no vite.config.ts

const Logo = () => (
  <img 
    src={logo} 
    alt="Snacks di Chris" 
    className="logo"
    width="120"
    height="60"
    loading="lazy"
  />
);

export default Logo;