import React, { useState, useEffect } from 'react';
import '../styles/ProductsDetails.css';
import { Minus, Plus, X } from 'lucide-react';
import { getLocalProductImageUrl } from '../constants';

const ProductsDetails = ({
  produto,
  onClose,
  adicionarAoCarrinho,
  irParaCarrinho,
  voltarParaProdutos
}) => {
  const [quantidade, setQuantidade] = useState(1);
  const [comentario, setComentario] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [mostrarOpcoes, setMostrarOpcoes] = useState(false);

  if (!produto) return null;

  const incrementar = () => setQuantidade(q => q + 1);
  const decrementar = () => setQuantidade(q => (q > 1 ? q - 1 : 1));
  const precoTotal = (produto.price * quantidade).toFixed(2);

  const ingredientesDetalhados = produto.ingredients
    ? produto.ingredients.split(',').map(ing => ing.trim())
    : [];

  const alergicosDetalhados = produto['allergenic-agents']
    ? produto['allergenic-agents'].split(',').map(al => al.trim())
    : [];

  const comentarioValido = comentario && comentario.trim().length >= 5;
  const idFinal = comentarioValido ? `${produto.id}-${Math.floor(Math.random() * 100000)}` : produto.id;

  const handleAdicionar = () => {
    const item = {
      id: idFinal,
      productname: produto.productname,
      price: produto.price,
      precoTotal: parseFloat(precoTotal),
      quantidade,
      comentario: comentarioValido ? comentario.trim() : "",
      imageUrl: getLocalProductImageUrl(produto.images),
    };

    adicionarAoCarrinho(item);
    setSucesso(true);
    setMostrarOpcoes(true);

    setTimeout(() => {
      setSucesso(false);
    }, 750);
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
        <button className="close-btn" onClick={onClose}><X /></button>
        <div className="modal-header">
          <div className="modal-header-left">
            <img
              src={produto.imageUrl || '/products/default.jpg'}
              alt={produto.productname}
              className="produto-img-modal"
            />
            <div className="produto-header">
              <h3>{produto.productname}</h3>
              {produto.available === false && (
                <div className="produto-indisponivel">Produto Indisponível</div>
              )}
            </div>
          </div>
          <div className="modal-header-right">
            <div className="preco-total">
              Total: R$ {precoTotal}
            </div>
            <div className="produto-detalhes">
              <p>{produto.description}</p>
              <p><strong>Ingredientes:</strong> {ingredientesDetalhados.join(', ')}</p>
              <p><strong>Alergênicos:</strong> {alergicosDetalhados.join(', ')}</p>
              {produto.available !== false && (
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
              )}
            </div>
          </div>
        </div>
        <div className="produto-footer">
          {sucesso ? (
            <div className="mensagem-sucesso">
              Produto adicionado com sucesso!
            </div>
          ) : !mostrarOpcoes ? (
            <>
              {produto.available !== false ? (
                <div className="contador-quantidade">
                  <div className="quantidade">
                    <button className="btn-counter" onClick={decrementar} disabled={quantidade <= 1} aria-label="Diminuir quantidade">
                      <Minus size={20} color="#FFFFFF" />
                    </button>

                    <div className="contador-valor">{quantidade}</div>

                    <button className="btn-counter" onClick={incrementar} aria-label="Aumentar quantidade">
                      <Plus size={20} color="#FFFFFF" />
                    </button>
                  </div>
                  <div className="adicionar-itens">
                    <button className="btn-adicionar-carrinho" onClick={handleAdicionar}>
                      Adicionar - R$ {precoTotal}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="produto-indisponivel-mensagem">
                  Este produto não está disponível para compra no momento.
                </div>
              )}
            </>
          ) : (
            <div className="opcoes-pos-adicao">
              <button className="link-opcao" onClick={handleComprarMais}>Comprar mais</button>
              <button className="link-opcao" onClick={handleIrParaCarrinho}>Ir para o carrinho</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsDetails;
