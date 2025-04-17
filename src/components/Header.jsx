import React from "react";
import logo from '../../assets/images/logo.svg'; // Importação correta
import "./Header.css";

export default function Header({ setFrame }) {
  return (
    <header className="header">
      <div className="header-content">
        <img 
          src={logo}  // Usando a importação
          alt="Logo Snacks di Chris" 
          className="logo" 
        />
        {/* ... */}
      </div>
    </header>
  );
}