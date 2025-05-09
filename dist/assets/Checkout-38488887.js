import{r as d,j as a,F as p}from"./vendor-6172415f.js";function k({carrinho:u,onCancelar:h,totalPedido:g,limparCarrinho:C,voltarParaInicio:i}){const[e,x]=d.useState({nome:"",telefone:"",endereco:"",bairro:"",cidade:"Goiânia",numero:"",semNumero:!1,complemento:"",referencia:"",instrucoes:"",pagamento:"Pix",troco:""}),[v,j]=d.useState(!1),o=r=>{const{name:s,value:c,type:l,checked:t}=r.target;x(n=>({...n,[s]:l==="checkbox"?t:c}))},f=()=>{if(!e.nome||!e.telefone||!e.endereco||!e.bairro||!e.cidade){alert("Preencha todos os campos obrigatórios.");return}j(!0)},N=r=>encodeURIComponent(r).replace(/%20/g," ").replace(/%2A/g,"*").replace(/%2D/g,"-").replace(/%3A/g,":").replace(/%2C/g,",").replace(/%C3%A7/g,"ç").replace(/%C3%A3/g,"ã").replace(/%C3%A1/g,"á").replace(/%C3%AA/g,"ê").replace(/%C3%A9/g,"é").replace(/%C3%AD/g,"í").replace(/%C3%B4/g,"ô").replace(/%C3%B5/g,"õ").replace(/%C3%BA/g,"ú").replace(/%C3%A2/g,"â").replace(/%C3%A0/g,"à"),b=()=>{const r=u.map(n=>{const m=n.quantidade||1,$=n.productname||n.nome,E=(n.price||n.preco).toFixed(2),S=(m*parseFloat(E)).toFixed(2),D=n.comentario?`Obs: ${n.comentario}`:"Sem observações";return`📝 *${$}*
Qtd: *${m}*
*${D}*
Subtotal: *R$ ${S}* 🔚`}).join(`

`),s=e.nome.toUpperCase(),c=`🙋‍♀️ Olá, esse é o meu pedido para
*SNACKS di Chris*

---------------------------
📦 *ITENS DO PEDIDO:*

${r}

---------------------------
ℹ️ *DADOS DO CLIENTE*

• Nome: *${s}*
• WhatsApp: *${e.telefone}*

🚚 *DADOS PARA ENTREGA*

• Endereço: *${e.endereco}${e.numero?`, Nº ${e.numero}`:""}${e.semNumero?" (Sem número)":""}${e.complemento?`, ${e.complemento}`:""}*
• Bairro: *${e.bairro}*
• Cidade: *${e.cidade}*
• Referência: *${e.referencia||"---"}*

• Instruções de Entrega:
*${e.instrucoes||"---"}*
---------------------------

🤑 *TOTAL E PAGAMENTO:*

💰 Total: *R$ ${parseFloat(g).toFixed(2)}*
💳 Pagamento em: *${e.pagamento}*`+(e.pagamento==="dinheiro"?e.troco?` (Troco para *R$ ${parseFloat(e.troco).toFixed(2)}*)`:" (Sem troco informado)":"")+`

_Pedido gerado automaticamente pelo Cardápio Digital SNACKS di Chris._`,t=`https://wa.me/5562999944838?text=${N(c)}`;window.open(t,"_blank"),C(),i()},A=()=>{i()};return a.jsx("div",{className:"finalizacao-overlay",children:a.jsxs("div",{className:"finalizacao-modal",children:[a.jsx("h2",{children:"Finalizar Pedido"}),v?a.jsxs("div",{children:[a.jsx("div",{className:"mensagem-envio",children:"Seu pedido vai ser enviado através do WhatsApp e será concluído pelo nosso time de atendimento assim que recebermos sua mensagem."}),a.jsxs("div",{className:"botoes-finalizacao",children:[a.jsx("button",{className:"btn-cancelar-envio",onClick:A,children:"Cancelar"}),a.jsxs("button",{className:"btn-confirmar-envio",onClick:b,children:[a.jsx(p,{className:"icon-whatsapp"})," Confirmar e Enviar"]})]})]}):a.jsxs("div",{className:"form",children:[a.jsx("input",{name:"nome",placeholder:"Nome completo",value:e.nome,onChange:o,required:!0}),a.jsx("input",{name:"telefone",placeholder:"WhatsApp (ex: 62999998888)",value:e.telefone,onChange:o,required:!0}),a.jsx("input",{name:"endereco",placeholder:"Endereço (Rua, Av., etc.)",value:e.endereco,onChange:o,required:!0}),a.jsx("input",{name:"bairro",placeholder:"Bairro",value:e.bairro,onChange:o,required:!0}),a.jsx("input",{name:"cidade",placeholder:"Cidade",value:e.cidade,onChange:o,required:!0}),a.jsxs("div",{className:"numero-row",children:[a.jsx("input",{name:"numero",placeholder:"Número",value:e.numero,onChange:o,disabled:e.semNumero}),a.jsxs("label",{children:[a.jsx("input",{type:"checkbox",name:"semNumero",checked:e.semNumero,onChange:o})," Sem número"]})]}),a.jsx("input",{name:"complemento",placeholder:"Complemento (quadra, lote, casa, etc.)",value:e.complemento,onChange:o,required:e.semNumero}),a.jsx("input",{name:"referencia",placeholder:"Ponto de referência (portão cinza, casa com muro vermelho, etc.)",value:e.referencia,onChange:o}),a.jsx("input",{name:"instrucoes",placeholder:"Instruções de entrega (me encontra na calçada, entregue ao porteiro, etc.)",value:e.instrucoes,onChange:o}),a.jsxs("select",{name:"pagamento",value:e.pagamento,onChange:o,children:[a.jsx("option",{value:"Pix",children:"Pix"}),a.jsx("option",{value:"cartao",children:"Cartão"}),a.jsx("option",{value:"dinheiro",children:"Dinheiro"})]}),e.pagamento==="dinheiro"&&a.jsx("input",{name:"troco",placeholder:"Troco para quanto?",value:e.troco,onChange:o}),a.jsxs("div",{className:"botoes-finalizacao",children:[a.jsx("button",{className:"btn-cancelar",onClick:h,children:"Cancelar"}),a.jsxs("button",{className:"btn-enviar",onClick:f,children:[a.jsx(p,{className:"icon-whatsapp"})," Enviar pedido pelo WhatsApp"]})]})]})]})})}export{k as default};
