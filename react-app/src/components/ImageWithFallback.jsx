import { useState } from 'react';
import { getImageUrl } from '../services/getImageUrl';

const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='600' viewBox='0 0 500 600'%3E%3Crect fill='%23f1f5f9' width='500' height='600'/%3E%3Cg transform='translate(200,250)'%3E%3Crect fill='%23e2e8f0' x='40' y='0' width='60' height='60' rx='8'/%3E%3Ccircle fill='%23cbd5e1' cx='70' cy='20' r='12'/%3E%3Cpath fill='%23cbd5e1' d='M50 48 L70 28 L90 48' stroke='%23cbd5e1' stroke-width='4' fill='none'/%3E%3C/g%3E%3Ctext x='250' y='340' text-anchor='middle' fill='%2394a3b8' font-family='Inter,system-ui,sans-serif' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E";

export default function ImageWithFallback({ src, alt, className, fallback, ...props }) {
  const resolved = getImageUrl(src);
  const [imgSrc, setImgSrc] = useState(resolved);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallback || PLACEHOLDER);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      {...props}
    />
  );
}
