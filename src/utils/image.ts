/**
 * Image processing utilities for Jilly Beauty Lab
 * Automatically resizes, centers, and compresses avatar images to lightweight data URLs
 * to ensure smooth rendering and safe storage in localStorage.
 */

export const compressAndResizeImage = (
  file: File,
  size = 300,
  quality = 0.85
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // If not an image, reject
    if (!file.type.startsWith('image/')) {
      reject(new Error('El archivo seleccionado no es una imagen válida.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }

          // Center-crop into square
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);

          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } catch {
          // Fallback to raw data url if canvas security/cors issue
          resolve(e.target?.result as string);
        }
      };

      img.onerror = () => {
        reject(new Error('No se pudo decodificar la imagen seleccionada.'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Error al leer el archivo desde el dispositivo.'));
    };

    reader.readAsDataURL(file);
  });
};
