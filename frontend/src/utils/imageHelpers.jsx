
export const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/');
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isImage) {
    message.error('You can only upload image files!');
    return Upload.LIST_IGNORE;
  }
  if (!isLt2M) {
    message.error('Image must be smaller than 2MB!');
    return Upload.LIST_IGNORE;
  }
  return true;
};


export const optimizeImage = (src, options = {}) => {
  const {
    width = 800,
    quality = 80,
    format = 'webp',
    loading = 'lazy'
  } = options;

  const cacheKey = `img-${src}-${width}-${quality}-${format}`;
  
  const cachedImage = localStorage.getItem(cacheKey);
  if (cachedImage) {
    return cachedImage;
  }

  const img = new Image();
  img.src = src;
  img.loading = loading;
  
  img.onload = () => {
    try {
      localStorage.setItem(cacheKey, src);
    } catch (e) {
      clearOldImageCache();
    }
  };

  return src;
};

const clearOldImageCache = () => {
  const keys = Object.keys(localStorage);
  const imageKeys = keys.filter(key => key.startsWith('img-'));
  
  if (imageKeys.length > 50) {
    const keysToRemove = imageKeys.slice(0, imageKeys.length - 50);
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
};

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

export const preloadImages = (imageUrls) => {
  imageUrls.forEach(url => {
    const img = new Image();
    img.src = url;
  });
};

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