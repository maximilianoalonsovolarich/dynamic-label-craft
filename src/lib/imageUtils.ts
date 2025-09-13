export const loadImageFromFile = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

export const loadImageFromUrl = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
};

export const resizeImage = (
  image: HTMLImageElement, 
  maxWidth: number, 
  maxHeight: number
): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  let { width, height } = image;
  
  // Calculate new dimensions
  if (width > height) {
    if (width > maxWidth) {
      height = height * (maxWidth / width);
      width = maxWidth;
    }
  } else {
    if (height > maxHeight) {
      width = width * (maxHeight / height);
      height = maxHeight;
    }
  }
  
  canvas.width = width;
  canvas.height = height;
  
  ctx.drawImage(image, 0, 0, width, height);
  return canvas;
};

export const cropImageToCircle = (image: HTMLImageElement): HTMLCanvasElement => {
  const size = Math.min(image.width, image.height);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  canvas.width = size;
  canvas.height = size;
  
  // Create circular clipping path
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
  ctx.clip();
  
  // Draw image
  const offsetX = (image.width - size) / 2;
  const offsetY = (image.height - size) / 2;
  ctx.drawImage(image, -offsetX, -offsetY);
  
  return canvas;
};

export const addImageFilter = (
  image: HTMLImageElement,
  filter: 'none' | 'grayscale' | 'sepia' | 'blur' | 'brightness' | 'contrast'
): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  canvas.width = image.width;
  canvas.height = image.height;
  
  switch (filter) {
    case 'grayscale':
      ctx.filter = 'grayscale(100%)';
      break;
    case 'sepia':
      ctx.filter = 'sepia(100%)';
      break;
    case 'blur':
      ctx.filter = 'blur(2px)';
      break;
    case 'brightness':
      ctx.filter = 'brightness(120%)';
      break;
    case 'contrast':
      ctx.filter = 'contrast(120%)';
      break;
    default:
      ctx.filter = 'none';
  }
  
  ctx.drawImage(image, 0, 0);
  return canvas;
};