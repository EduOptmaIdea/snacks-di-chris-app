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
      img.onerror = () => setImgSrc('/products/default.jpg');
    } else {
      setImgSrc('/products/default.jpg');
    }
  }, [imageName]);

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={(e) => {
        e.target.src = '/products/default.jpg';
      }}
    />
  );
};

export default ProductImage;