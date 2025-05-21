// src/components/ProductImage.jsx
import { useEffect, useState } from 'react';
import { getLocalProductImageUrl } from '../constants';

const ProductImage = ({ imageName, alt, className }) => {
  const [imgSrc, setImgSrc] = useState('');

  useEffect(() => {
    if (imageName) {
      const imgUrl = getLocalProductImageUrl(imageName);
      const img = new Image();
      img.src = imgUrl;
      
      img.onload = () => setImgSrc(imgUrl);
      img.onerror = () => setImgSrc('/default.webp');
    } else {
      setImgSrc('/default.webp');
    }
  }, [imageName]);

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={(e) => {
        e.target.src = '/default.webp';
      }}
    />
  );
};

export default ProductImage;