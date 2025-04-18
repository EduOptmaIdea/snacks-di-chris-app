import React, { useState } from 'react';
import '../styles/Frame5DetalhesProduto.css';

const Frame5DetalhesProduto = ({ produto, onClose, adicionarAoCarrinho, irParaCarrinho, voltarParaProdutos }) => {
  const [quantidade, setQuantidade] = useState(1);
  const [comentario, setComentario] = useState("");
  const [mostrarOpcoes, setMostrarOpcoes] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  if (!produto) return null;

  const incrementar = () => setQuantidade(q => q + 1);
  const decrementar = () => setQuantidade(q => (q > 1 ? q - 1 : 1));

  const precoTotal = (produto.price * quantidade).toFixed(2);

  const ingredientesDetalhados = produto.ingredients ? produto.ingredients.split(',').map(ing => ing.trim()) : [];
  const alergicosDetalhados = produto['allergenic-agents'] ? produto['allergenic-agents'].split(',').map(al => al.trim()) : [];

  const handleAdicionarAoCarrinho = () => {
    const itemComIdentificador = {
      ...produto,
      quantidade,
      comentario,
      idUnico: `${produto.id}-${comentario.replace(/\s+/g, '-')}-${Date.now()}`
    };
    adicionarAoCarrinho(itemComIdentificador);
    setSucesso(true);
    setTimeout(() => {
      setMostrarOpcoes(true);
      setSucesso(false);
    }, 1000);
  };

  const handleComprarMais = () => {
    setMostrarOpcoes(false);
    onClose();
    voltarParaProdutos();
  };

  const handleIrParaCarrinho = () => {
    setMostrarOpcoes(false);
    onClose();
    irParaCarrinho();
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
            <h2>{produto.productname}</h2>
            <div className="preco">R$ {produto.price.toFixed(2)}</div>
          </div>

          <div className="produto-scroll">
            <p>{produto.description}</p>
            <p><strong>Ingredientes:</strong> {ingredientesDetalhados.join(', ')}</p>
            <p><strong>Alergênicos:</strong> {alergicosDetalhados.join(', ')}</p>

            <div className="comentario-area">
              <label htmlFor="comentario" className="comentario-label">Algum comentário?</label>
              <textarea
                id="comentario"
                className="comentario-input"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Ex: Retirar cebola, adicionar maionese..."
              />
            </div>
          </div>

          <div className="produto-footer">
            {sucesso ? (
              <div className="mensagem-sucesso">Item adicionado com sucesso!</div>
            ) : !mostrarOpcoes ? (
              <>
                <div className="contador-quantidade">
                  <button onClick={decrementar} disabled={quantidade <= 1} aria-label="Diminuir quantidade">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#EA1D2C">
                      <path d="M17.993 11c.556 0 1.007.444 1.007 1 0 .552-.45 1-1.007 1H6.007A1.001 1.001 0 0 1 5 12c0-.552.45-1 1.007-1h11.986z" />
                    </svg>
                  </button>

                  <div className="contador-valor">{quantidade}</div>

                  <button onClick={incrementar} aria-label="Aumentar quantidade">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#EA1D2C">
                      <path d="M13 11h4.993c.556 0 1.007.444 1.007 1 0 .552-.45 1-1.007 1H13v4.993C13 18.55 12.556 19 12 19c-.552 0-1-.45-1-1.007V13H6.007A1.001 1.001 0 0 1 5 12c0-.552.45-1 1.007-1H11V6.007C11 5.45 11.444 5 12 5c.552 0 1 .45 1 1.007V11z" />
                    </svg>
                  </button>
                </div>

                <button className="btn-adicionar-carrinho" onClick={handleAdicionarAoCarrinho}>
                  Adicionar – R$ {precoTotal}
                </button>
              </>
            ) : (
              <div className="opcoes-pos-adicao">
                <p className="texto-opcao">O que deseja fazer?</p>
                <span className="link-opcao" onClick={handleComprarMais}>Adicionar mais itens</span>
                <span className="link-opcao" onClick={handleIrParaCarrinho}>Ir para o carrinho</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Frame5DetalhesProduto;
