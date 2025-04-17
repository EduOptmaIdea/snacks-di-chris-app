import React from "react";

export default function Header({ setFrame }) {
  return (
    <header>
      <div className="header-content">
        <img src="/logo.svg" alt="Logo Snacks di Chris" className="logo" style={{ height: "90px" }}/>
        <button className="menu-button" onClick={() => setFrame(1)}>
          Cardápio
        </button>
      </div>
    </header>
  );
}
