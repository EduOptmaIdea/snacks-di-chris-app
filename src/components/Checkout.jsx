import React, { useState } from 'react';
import '../styles/Checkout.css';
import { FaWhatsapp } from 'react-icons/fa';

export default function Checkout({ carrinho, onCancelar, totalPedido, limparCarrinho, voltarParaInicio }) {
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    endereco: '',
    bairro: '',
    cidade: 'Goiânia',
    numero: '',
    semNumero: false,
    complemento: '',
    referencia: '',
    instrucoes: '',
    pagamento: 'Pix',
    troco: ''
  });

  const [mostrarMensagemEnvio, setMostrarMensagemEnvio] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEnviar = () => {
    if (!formData.nome || !formData.telefone || !formData.endereco || !formData.bairro || !formData.cidade) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }
    setMostrarMensagemEnvio(true);
  };

  const encodeSmart = (str) => {
    return encodeURIComponent(str)
      .replace(/%20/g, ' ')
      .replace(/%2A/g, '*')
      .replace(/%2D/g, '-')
      .replace(/%3A/g, ':')
      .replace(/%2C/g, ',')
      .replace(/%C3%A7/g, 'ç')
      .replace(/%C3%A3/g, 'ã')
      .replace(/%C3%A1/g, 'á')
      .replace(/%C3%AA/g, 'ê')
      .replace(/%C3%A9/g, 'é')
      .replace(/%C3%AD/g, 'í')
      .replace(/%C3%B4/g, 'ô')
      .replace(/%C3%B5/g, 'õ')
      .replace(/%C3%BA/g, 'ú')
      .replace(/%C3%A2/g, 'â')
      .replace(/%C3%A0/g, 'à');
  };
  
  const handleConfirmarEnvio = () => {
    const itensFormatados = carrinho.map(item => {
      const qtd = item.quantidade || 1;
      // Verificar todas as possíveis propriedades de nome do produto
      const nome = item.productname || item.name || item.nome || "Produto";
      console.log("Nome do produto no carrinho:", nome, item);
      
      const preco = (item.price || item.preco || 0).toFixed(2);
      const subtotal = (qtd * parseFloat(preco)).toFixed(2);
      const obs = item.comentario ? `Obs: ${item.comentario}` : 'Sem observações';
      return `📝 *${nome}*\nQtd: *${qtd}*\n*${obs}*\nSubtotal: *R$ ${subtotal}* 🔚`;
    }).join('\n\n');
  
    const nomeMaiusculo = formData.nome.toUpperCase();
  
    const mensagem = `🙋‍♀️ Olá, esse é o meu pedido para\n*SNACKS di Chris*\n\n` +
    `---------------------------\n` +
    `📦 *ITENS DO PEDIDO:*\n\n${itensFormatados}\n\n` +
    `---------------------------\n` +
    `ℹ️ *DADOS DO CLIENTE*\n\n` +
    `• Nome: *${nomeMaiusculo}*\n` +
    `• WhatsApp: *${formData.telefone}*\n\n` +
    `🚚 *DADOS PARA ENTREGA*\n\n` +    
    `• Endereço: *${formData.endereco}${formData.numero ? `, Nº ${formData.numero}` : ''}${formData.semNumero ? ' (Sem número)' : ''}${formData.complemento ? `, ${formData.complemento}` : ''}*\n` +
    `• Bairro: *${formData.bairro}*\n` +
    `• Cidade: *${formData.cidade}*\n` +
    `• Referência: *${formData.referencia || '---'}*\n\n` +
    `• Instruções de Entrega:\n` +
    `*${formData.instrucoes || '---'}*\n` +
    `---------------------------\n\n` +
    `🤑 *TOTAL E PAGAMENTO:*\n\n` +
    `💰 Total: *R$ ${parseFloat(totalPedido).toFixed(2)}*\n` +
    `💳 Pagamento em: *${formData.pagamento}*` +
    (formData.pagamento === 'dinheiro' ? (formData.troco ? ` (Troco para *R$ ${parseFloat(formData.troco).toFixed(2)}*)` : ' (Sem troco informado)') : '') +
    `\n\n_Pedido gerado automaticamente pelo Cardápio Digital SNACKS di Chris._`;
  
    // Codificar a mensagem corretamente
    const mensagemCodificada = encodeSmart(mensagem);

    const url = `https://wa.me/5562999944838?text=${mensagemCodificada}`;
    window.open(url, '_blank');
  
    limparCarrinho();
    voltarParaInicio();
  };

  const handleCancelarEnvio = () => {
    voltarParaInicio();
  };

  return (
    <div className="finalizacao-overlay">
      <div className="finalizacao-modal">
        <h2>Finalizar Pedido</h2>

        {!mostrarMensagemEnvio ? (
          <div className="form">
            <input name="nome" placeholder="Nome completo" value={formData.nome} onChange={handleChange} required />
            <input name="telefone" placeholder="WhatsApp (ex: 62999998888)" value={formData.telefone} onChange={handleChange} required />
            <input name="endereco" placeholder="Endereço (Rua, Av., etc.)" value={formData.endereco} onChange={handleChange} required />
            <input name="bairro" placeholder="Bairro" value={formData.bairro} onChange={handleChange} required />
            <input name="cidade" placeholder="Cidade" value={formData.cidade} onChange={handleChange} required />

            <div className="numero-row">
              <input name="numero" placeholder="Número" value={formData.numero} onChange={handleChange} disabled={formData.semNumero} />
              <label>
                <input type="checkbox" name="semNumero" checked={formData.semNumero} onChange={handleChange} /> Sem número
              </label>
            </div>

            <input name="complemento" placeholder="Complemento (quadra, lote, casa, etc.)" value={formData.complemento} onChange={handleChange} required={formData.semNumero} />
            <input name="referencia" placeholder="Ponto de referência (portão cinza, casa com muro vermelho, etc.)" value={formData.referencia} onChange={handleChange} />
            <input name="instrucoes" placeholder="Instruções de entrega (me encontra na calçada, entregue ao porteiro, etc.)" value={formData.instrucoes} onChange={handleChange} />

            <select name="pagamento" value={formData.pagamento} onChange={handleChange}>
              <option value="Pix">Pix</option>
              <option value="cartao">Cartão</option>
              <option value="dinheiro">Dinheiro</option>
            </select>

            {formData.pagamento === 'dinheiro' && (
              <input name="troco" placeholder="Troco para quanto?" value={formData.troco} onChange={handleChange} />
            )}

            <div className="botoes-finalizacao">
              <button className="btn-cancelar" onClick={onCancelar}>Cancelar</button>
              <button className="btn-enviar" onClick={handleEnviar}>
                <FaWhatsapp className="icon-whatsapp" /> Enviar pedido pelo WhatsApp
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mensagem-envio">
              Seu pedido vai ser enviado através do WhatsApp e será concluído pelo nosso time de atendimento assim que recebermos sua mensagem.
            </div>
            <div className="botoes-finalizacao">
              <button className="btn-cancelar-envio" onClick={handleCancelarEnvio}>Cancelar</button>
              <button className="btn-confirmar-envio" onClick={handleConfirmarEnvio}>
                <FaWhatsapp className="icon-whatsapp" /> Confirmar e Enviar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
