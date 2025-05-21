// Funções para gerar mensagens
const generateContactMessage = () => {
  const hour = new Date().getHours();
  let greeting;
  
  if (hour >= 5 && hour < 12) {
    greeting = "Bom dia";
  } else if (hour >= 12 && hour < 18) {
    greeting = "Boa tarde";
  } else {
    greeting = "Boa noite";
  }

  return `${greeting}%2C%20gostaria%20de%20falar%20com%20a%20*_SNACKS%20di%20Chris_*`;
};

const generatePrivacyMessage = () => {
  const hour = new Date().getHours();
  let greeting;
  
  if (hour >= 5 && hour < 12) {
    greeting = "Bom dia";
  } else if (hour >= 12 && hour < 18) {
    greeting = "Boa tarde";
  } else {
    greeting = "Boa noite";
  }

  return `${greeting}%2C%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es%20sobre%20a%20*Pol%C3%ADtica%20de%20Privacidade*%20de%20voc%C3%AAs`;
};

// URLs base
export const WHATSAPP_BASE_URL = 'https://wa.me/5562999944838';

// URLs completas com mensagens específicas
export const WHATSAPP_URL = `${WHATSAPP_BASE_URL}?text=${generateContactMessage()}`;
export const WHATSAPP_PRIVACY_URL = `${WHATSAPP_BASE_URL}?text=${generatePrivacyMessage()}`;

// Funções atualizadas para imagens do Firebase Storage
export const getImageUrl = (path) => {
  if (!path) return '/default.webp';
  if (path.startsWith('http')) return path; // Se já for uma URL completa, use-a diretamente
  if (path.startsWith('/')) return path; // Se for um caminho local, use-o diretamente
  // Se for uma referência ao Storage, use-a diretamente
  return path;
};

export const getLocalImageUrl = (imageName) => {
  if (!imageName) return '/default.webp';
  if (imageName.startsWith('http')) return imageName; // Se já for uma URL completa, use-a diretamente
  const cleanName = imageName.split('/').pop();
  return `/categories/${cleanName}`;
};

export const getLocalProductImageUrl = (imageName) => {
  if (!imageName) return '/default.webp';
  if (imageName.startsWith('http')) return imageName; // Se já for uma URL completa, use-a diretamente
  const cleanName = imageName.split('/').pop();
  return `/products/${cleanName}`;
};

export const PRIVACY_POLICY_URL = '/politica-de-privacidade';
