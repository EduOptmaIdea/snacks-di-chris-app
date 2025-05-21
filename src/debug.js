// Arquivo de depuração para rastrear o fluxo de dados dos produtos
// Adicione este arquivo ao seu projeto e importe-o onde necessário

export const logProductData = (source, product, additionalInfo = '') => {
  console.log(`[DEBUG - ${source}] Dados do produto:`, {
    id: product.id,
    productname: product.productname, // Campo original do Firebase (com N maiúsculo)
    productname: product.productname, // Campo esperado pelos componentes (tudo minúsculo)
    name: product.name,               // Alternativa 1
    nome: product.nome,               // Alternativa 2
    rawData: product,                 // Objeto completo para inspeção
    additionalInfo
  });
};

export const logFirestoreData = (source, data, docId) => {
  console.log(`[DEBUG - ${source}] Dados brutos do Firestore:`, {
    docId,
    productname: data.productname,
    name: data.name,
    allKeys: Object.keys(data),
    rawData: data
  });
};

export const logComponentProps = (componentName, props) => {
  console.log(`[DEBUG - ${componentName}] Props recebidas:`, props);
};
