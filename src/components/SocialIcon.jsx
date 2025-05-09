import React from 'react';

// Importações diretas usando alias do Vite
import instagramIcon from '@img/icons/instagram-logo-branca.webp';
import whatsappIcon from '@img/icons/whatsapp-logo-branca.webp';
import ifoodIcon from '@img/icons/ifood-logo-branca.webp';

const SocialIcon = ({ url, platform, alt }) => {
  // Mapeamento dos ícones importados
  const iconMap = {
    instagram: instagramIcon,
    whatsapp: whatsappIcon,
    ifood: ifoodIcon
  };

  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      <img 
        src={iconMap[platform]} 
        alt={alt}
        className="footer-icon"
        width="auto"
        height="32"
        loading="lazy"
      />
    </a>
  );
};

export default React.memo(SocialIcon);