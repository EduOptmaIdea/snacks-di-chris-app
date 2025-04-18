import React, { useState } from 'react';
import '../styles/CarrinhoFrame.css';

const CarrinhoFrame = ({ items, onClose, onRemoveItem, onClearCart, onVoltarProdutos, onUpdateQuantidade }) => {
  const [quantidade, setQuantidade] = useState(
    items.reduce((acc, item) => ({ ...acc, [item.id]: item.quantidade || 1 }), {})
  );

  const incrementar = (id) => {
    setQuantidade(prev => {
      const novaQtd = (prev[id] || 1) + 1;
      onUpdateQuantidade(id, novaQtd);
      return { ...prev, [id]: novaQtd };
    });
  };

  const decrementar = (id) => {
    setQuantidade(prev => {
      const novaQtd = prev[id] > 1 ? prev[id] - 1 : 1;
      onUpdateQuantidade(id, novaQtd);
      return { ...prev, [id]: novaQtd };
    });
  };

  const total = items.reduce((acc, item) => {
    const qtd = quantidade[item.id] || item.quantidade || 1;
    const precoUnitario = item.price || item.preco || 0;
    return acc + precoUnitario * qtd;
  }, 0).toFixed(2);

  const handleRemove = (id) => {
    onRemoveItem(id);
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>X</button>

        <div className="carrinho-content">
          {items.length === 0 ? (
            <div className="carrinho-vazio">
              <img src="assets/images/icons/carrinho-vazio.svg" alt="Carrinho vazio" className="img-vazio" />
              <h2>Carrinho vazio</h2>
              <button className="btn-voltar" onClick={onVoltarProdutos}>Voltar aos produtos</button>
            </div>
          ) : (
            <>
              <div className="itens-carrinho">
                {items.map(item => (
                  <div className="item" key={`${item.id}-${item.comentario || ''}`.replace(/\s+/g, '-') }>
                    <img
                      src={item.images || item.imagens || '/img/produtos/default.jpg'}
                      alt={item.productname || item.nome}
                      className="item-img-pequena"
                    />
                    <div className="item-details">
                      <h3>{item.productname || item.nome}</h3>
                      {item.comentario && <p className="comentario-item">Obs: {item.comentario}</p>}
                      <div className="preco">R$ {(item.price || item.preco)?.toFixed(2) || '0,00'}</div>

                      <div className="contador-quantidade">
                        <button onClick={() => decrementar(item.id)} disabled={quantidade[item.id] <= 1}>-</button>
                        <div className="contador-valor">{quantidade[item.id] || item.quantidade || 1}</div>
                        <button onClick={() => incrementar(item.id)}>+</button>
                      </div>
                    </div>
                    <button className="btn-remover" onClick={() => handleRemove(item.id)}>🗑</button>
                  </div>
                ))}
              </div>

              <div className="carrinho-footer">
                <div className="total">
                  <span>Total: R$ {isNaN(total) ? '0,00' : total}</span>
                </div>
                <div className="botoes-carrinho">
                  <button className="btn-limpar" onClick={onClearCart}>Limpar Carrinho</button>
                  <button className="btn-finalizar">Finalizar Compra</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarrinhoFrame;
