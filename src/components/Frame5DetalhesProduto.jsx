import React, { useState } from 'react';
import '../styles/Frame5DetalhesProduto.css';

const Frame5DetalhesProduto = ({ produto, onClose, adicionarAoCarrinho }) => {
  const [quantidade, setQuantidade] = useState(1);
  const [comentario, setComentario] = useState("");

  if (!produto) return null;

  const incrementar = () => setQuantidade(q => q + 1);
  const decrementar = () => setQuantidade(q => (q > 1 ? q - 1 : 1));

  const precoTotal = (produto.price * quantidade).toFixed(2);  // Corrigido para 'price'

  // Ingredientes e alergênicos agora vêm do produto, ajustados conforme o formato do endpoint
  const ingredientesDetalhados = produto.ingredients ? produto.ingredients.split(',').map(ing => ing.trim()) : [];
  const alergicosDetalhados = produto['allergenic-agents'] ? produto['allergenic-agents'].split(',').map(al => al.trim()) : [];

  const handleAdicionarAoCarrinho = () => {
    // Passando o item para o carrinho
    adicionarAoCarrinho({ ...produto, quantidade, comentario });
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>X</button>

        <img
          src={produto.images || 'assets/images/products/default.jpg'}
          alt={produto.productname}
          className="produto-img-modal"
        />

        <div className="produto-details">
          <div className="produto-header">
            <h2>{produto.productname}</h2> {/* Atualizado para productname */}
            <div className="preco">R$ {produto.price.toFixed(2)}</div> {/* Atualizado para price */}
          </div>

          <div className="produto-scroll">
            <p>{produto.description}</p> {/* Atualizado para description */}
            <p><strong>Ingredientes:</strong> {ingredientesDetalhados.join(', ')}</p>
            <p><strong>Alergênicos:</strong> {alergicosDetalhados.join(', ')}</p>

            <div className="comentario-area">
              <label htmlFor="comentario">Algum comentário?</label>
              <textarea
                id="comentario"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Ex: Retirar cebola, adicionar maionese..."
              />
            </div>
          </div>

          <div className="produto-footer">
            <div className="contador-quantidade">
              <button onClick={decrementar} disabled={quantidade <= 1} aria-label="Diminuir quantidade">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#EA1D2C">
                  <path d="M17.993 11c.556 0 1.007.444 1.007 1 0 .552-.45 1-1.007 1H6.007A1.001 1.001 0 0 1 5 12c0-.552.45-1 1.007-1h11.986z"/>
                </svg>
              </button>

              <div className="contador-valor">{quantidade}</div>

              <button onClick={incrementar} aria-label="Aumentar quantidade">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#EA1D2C">
                  <path d="M13 11h4.993c.556 0 1.007.444 1.007 1 0 .552-.45 1-1.007 1H13v4.993C13 18.55 12.556 19 12 19c-.552 0-1-.45-1-1.007V13H6.007A1.001 1.001 0 0 1 5 12c0-.552.45-1 1.007-1H11V6.007C11 5.45 11.444 5 12 5c.552 0 1 .45 1 1.007V11z"/>
                </svg>
              </button>
            </div>

            <button className="btn-adicionar-carrinho" onClick={handleAdicionarAoCarrinho}>
              Adicionar – R$ {precoTotal}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Frame5DetalhesProduto;
