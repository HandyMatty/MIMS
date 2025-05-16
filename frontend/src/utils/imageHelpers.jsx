import { message } from 'antd';
import React from 'react';

export const beforeUpload = (file) => {
  return new Promise((resolve, reject) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG files!');
      return reject(); // prevent upload
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must be smaller than 2MB!');
      return reject(); // prevent upload
    }

    return resolve(); // allow upload
  });
};

// Image optimization utility
export const optimizeImage = (src, options = {}) => {
  const {
    width = 800,
    quality = 80,
    format = 'webp',
    loading = 'lazy'
  } = options;

  // Create a cache key based on the image source and options
  const cacheKey = `img-${src}-${width}-${quality}-${format}`;
  
  // Check if the image is already in cache
  const cachedImage = localStorage.getItem(cacheKey);
  if (cachedImage) {
    return cachedImage;
  }

  // Create a new image element to preload
  const img = new Image();
  img.src = src;
  img.loading = loading;
  
  // Add to cache when loaded
  img.onload = () => {
    try {
      localStorage.setItem(cacheKey, src);
    } catch (e) {
      // If localStorage is full, clear old entries
      clearOldImageCache();
    }
  };

  return src;
};

// Clear old image cache entries
const clearOldImageCache = () => {
  const keys = Object.keys(localStorage);
  const imageKeys = keys.filter(key => key.startsWith('img-'));
  
  // Remove oldest entries if more than 50 images are cached
  if (imageKeys.length > 50) {
    const keysToRemove = imageKeys.slice(0, imageKeys.length - 50);
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
};

// Lazy load image component
export const LazyImage = ({ src, alt, className, width, height, ...props }) => {
  const optimizedSrc = optimizeImage(src, { width, loading: 'lazy' });

  return (
    <img
      src={optimizedSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading="lazy"
      {...props}
    />
  );
};

// Preload critical images
export const preloadImages = (imageUrls) => {
  imageUrls.forEach(url => {
    const img = new Image();
    img.src = url;
  });
};

// Get image dimensions
export const getImageDimensions = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height
      });
    };
    img.onerror = reject;
    img.src = src;
  });
}; 