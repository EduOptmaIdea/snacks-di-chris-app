import React, { useState } from 'react';
import '../styles/CarrinhoFrame.css';

const CarrinhoFrame = ({ items, onClose, onRemoveItem, onClearCart, onVoltarProdutos }) => {
  const [quantidade, setQuantidade] = useState(
    items.reduce((acc, item) => ({ ...acc, [item.id]: item.quantidade || 1 }), {})
  );

  const incrementar = (id) => {
    setQuantidade(prev => ({ ...prev, [id]: (prev[id] || 1) + 1 }));
  };

  const decrementar = (id) => {
    setQuantidade(prev => ({
      ...prev,
      [id]: prev[id] > 1 ? prev[id] - 1 : 1,
    }));
  };

  const total = items.reduce((acc, item) => {
    const qtd = quantidade[item.id] || 1;
    return acc + item.preco * qtd;
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
              <img src="/img/icons/carrinho-vazio.svg" alt="Carrinho vazio" className="img-vazio" />
              <h2>Carrinho vazio</h2>
              <button className="btn-voltar" onClick={onVoltarProdutos}>Voltar aos produtos</button>
            </div>
          ) : (
            <>
              <div className="itens-carrinho">
                {items.map(item => (
                  <div className="item" key={item.id}>
                    <img
                      src={item.imagem || '/img/produtos/default.jpg'}
                      alt={item.nome}
                      className="item-img-pequena"
                    />
                    <div className="item-details">
                      <h3>{item.nome}</h3>
                      <div className="preco">R$ {item.preco.toFixed(2)}</div>

                      <div className="contador-quantidade">
                        <button onClick={() => decrementar(item.id)} disabled={quantidade[item.id] <= 1}>-</button>
                        <div className="contador-valor">{quantidade[item.id] || 1}</div>
                        <button onClick={() => incrementar(item.id)}>+</button>
                      </div>
                    </div>
                    <button className="btn-remover" onClick={() => handleRemove(item.id)}>🗑</button>
                  </div>
                ))}
              </div>

              <div className="carrinho-footer">
                <div className="total">
                  <span>Total: R$ {total}</span>
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
