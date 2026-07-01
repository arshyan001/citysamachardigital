import React, { useState, useEffect } from 'react';

export default function LazyImage({ src, alt, className, style }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState('');

  useEffect(() => {
    setIsLoaded(false);
    if (!src) return;

    const img = new Image();
    img.src = src;
    img.onload = () => {
      setCurrentSrc(src);
      setIsLoaded(true);
    };
    img.onerror = () => {
      // Fallback if image fails to load
      setCurrentSrc(src);
      setIsLoaded(true);
    };
  }, [src]);

  return (
    <div 
      className={`lazy-image-container ${isLoaded ? 'loaded' : 'loading'}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--fb-hover-bg)',
        width: '100%',
        height: '100%',
        borderRadius: style?.borderRadius || 'inherit',
        ...style
      }}
    >
      {/* Shimmer wave effect */}
      {!isLoaded && (
        <div 
          className="shimmer"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0) 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer-wave 1.5s infinite linear',
            zIndex: 1
          }}
        />
      )}

      {currentSrc && (
        <img
          src={currentSrc}
          alt={alt}
          className={className}
          style={{
            width: '100%',
            height: '100%',
            objectFit: style?.objectFit || 'cover',
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'block'
          }}
          loading="lazy"
        />
      )}
    </div>
  );
}
