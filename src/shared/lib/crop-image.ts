export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

export interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: PixelCrop,
  minSize: number = 750
): Promise<string> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  canvas.width = safeArea;
  canvas.height = safeArea;

  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5
  );

  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  // Create a temporary canvas for the cropped area
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  
  if (!tempCtx) {
    throw new Error('Could not get temp canvas context');
  }

  tempCanvas.width = pixelCrop.width;
  tempCanvas.height = pixelCrop.height;

  tempCtx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
  );

  // Determine final output size based on cropped dimensions
  const croppedSize = Math.min(pixelCrop.width, pixelCrop.height);
  const finalSize = croppedSize >= minSize ? croppedSize : minSize;
  
  console.log(`Cropped size: ${pixelCrop.width}x${pixelCrop.height}, Final size: ${finalSize}x${finalSize}`);

  // Set canvas to final size
  canvas.width = finalSize;
  canvas.height = finalSize;

  // Draw the cropped image at final size
  ctx.drawImage(tempCanvas, 0, 0, pixelCrop.width, pixelCrop.height, 0, 0, finalSize, finalSize);

  return new Promise((resolve) => {
    canvas.toBlob((file) => {
      if (file) {
        resolve(URL.createObjectURL(file));
      }
    }, 'image/jpeg', 0.9); // 90% quality for good balance of size and quality
  });
};
