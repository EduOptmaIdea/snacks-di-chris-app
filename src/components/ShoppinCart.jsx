import React, { useState } from 'react';
import '../styles/ShoppinCart.css';
import Checkout from './Checkout';
import { Minus, Plus, Trash2, X } from 'lucide-react';
import { getLocalProductImageUrl } from '../constants';
import vazio from '../assets/imgs/icons/carrinho-vazio.svg';

const ShoppinCart = ({ 
  items, 
  onClose, 
  onRemoveItem, 
  onClearCart, 
  voltarParaProdutos, 
  onUpdateQuantidade
}) => {
  const [quantidades, setQuantidades] = useState(
    items.reduce((acc, item) => ({ ...acc, [item.id]: item.quantidade || 1 }), {})
  );
  const [showFinalizacao, setShowFinalizacao] = useState(false);

  // Atualização da função de processamento das imagens
  const processedItems = items.map(item => ({
    ...item,
    imageUrl: item.imageUrl || getLocalProductImageUrl(item.images || item.image)
  }));

  const incrementar = (id) => {
    setQuantidades(prev => {
      const novaQtd = (prev[id] || 1) + 1;
      onUpdateQuantidade(id, novaQtd);
      return { ...prev, [id]: novaQtd };
    });
  };

  const decrementar = (id) => {
    setQuantidades(prev => {
      const novaQtd = Math.max(1, (prev[id] || 1) - 1);
      onUpdateQuantidade(id, novaQtd);
      return { ...prev, [id]: novaQtd };
    });
  };

  const total = processedItems.reduce((acc, item) => {
    const qtd = quantidades[item.id] || 1;
    return acc + (item.price * qtd);
  }, 0).toFixed(2);

  const handleFinalizarCompra = () => {
    setShowFinalizacao(true);
  };

  const handleFecharFinalizacao = () => {
    setShowFinalizacao(false);
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}><X/></button>

        <div className="carrinho-content">
          {processedItems.length === 0 ? (
            <div className="carrinho-vazio">
              <img src={vazio} alt="Carrinho vazio" className="img-vazio" />
              <h2>Carrinho vazio</h2>
              <button
                className="btn-voltar"
                onClick={() => {
                  onClose();
                  voltarParaProdutos();
                }}
              >
                Voltar aos produtos
              </button>
            </div>
          ) : (
            <>
              <div className="itens-carrinho">
                {processedItems.map(item => (
                  <div 
                    className="item" 
                    key={`${item.id}-${item.comentario || ''}`.replace(/\s+/g, '-')}
                  >
                    <img 
                      src={item.imageUrl || '/products/default.jpg'}
                      alt={item.productname}
                      className="item-img-pequena"
                      onError={(e) => {
                        e.target.src = '/products/default.jpg';
                        e.target.onerror = null;
                      }}
                    />
                    
                    <div className="item-details">
                      <h3>{item.productname}</h3>
                      {item.comentario && (
                        <p className="comentario-item">Obs: {item.comentario}</p>
                      )}
                      <div className="preco">
                        R$ {(item.price * (quantidades[item.id] || 1)).toFixed(2)}
                      </div>

                      <div className="contador-quantidade">
                        <button 
                          onClick={() => decrementar(item.id)} 
                          disabled={quantidades[item.id] <= 1}
                          aria-label="Diminuir quantidade"
                        >
                          <Minus size={17}/>
                        </button>
                        <div className="contador-valor">
                          {quantidades[item.id] || 1}
                        </div>
                        <button 
                          onClick={() => incrementar(item.id)}
                          aria-label="Aumentar quantidade"
                        >
                          <Plus size={17}/>
                        </button>
                        <button 
                          onClick={() => onRemoveItem(item.id)}
                          aria-label="Remover item"
                          className="text-xs"
                        >
                          <Trash2 size={17}/>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="carrinho-footer">
                <div className="total">
                  <span>Total: R$ {total}</span>
                </div>
                <div className="botoes-carrinho">
                  <button 
                    className="btn-voltar" 
                    onClick={() => {
                      onClose();
                      voltarParaProdutos();
                    }}
                  >
                    Comprar mais
                  </button>
                  <button 
                    className="btn-finalizar" 
                    onClick={handleFinalizarCompra}
                    disabled={processedItems.length === 0}
                  >
                    Finalizar compra
                  </button>
                  <button 
                    className="btn-limpar" 
                    onClick={onClearCart}
                    disabled={processedItems.length === 0}
                  >
                    Limpar carrinho
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {showFinalizacao && (
        <div className="finalizacao-overlay" onClick={handleFecharFinalizacao}>
          <div className="finalizacao-modal" onClick={(e) => e.stopPropagation()}>
            <Checkout
              carrinho={processedItems}
              totalPedido={total}
              onCancelar={handleFecharFinalizacao}
              limparCarrinho={onClearCart}
              voltarParaInicio={() => {
                handleFecharFinalizacao();
                onClose();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppinCart;