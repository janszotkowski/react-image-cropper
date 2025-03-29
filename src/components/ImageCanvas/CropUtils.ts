import { CropArea } from '@/store';
import { drawImage } from './DrawImage';
import { notificationService } from '@/service';

export type ImageTransformation = {
    position: { x: number; y: number; };
    scale: number;
    isFlippedHorizontally: boolean;
    isFlippedVertically: boolean;
    rotation: number;
};

/**
 * Function for creating a crop from an image
 */
export const applyCropToImage = (canvas: HTMLCanvasElement, image: HTMLImageElement, cropArea: CropArea, transformation: ImageTransformation): Promise<string> => {
    return new Promise((resolve, reject) => {
        try {
            // Create a temporary canvas for the original image
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');

            if (!tempCtx) {
                reject(new Error('Could not get 2D context for temporary canvas'));
                return;
            }

            // Set the size of the temporary canvas based on the source canvas size
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;

            // Draw only the image (without crop overlay)
            tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
            drawImage({
                ctx: tempCtx,
                canvas: tempCanvas,
                image,
                position: transformation.position,
                scale: transformation.scale,
                isFlippedHorizontally: transformation.isFlippedHorizontally,
                isFlippedVertically: transformation.isFlippedVertically,
                rotation: transformation.rotation,
            });

            // Create a result canvas for the cropped image
            const resultCanvas = document.createElement('canvas');
            const resultCtx = resultCanvas.getContext('2d');

            if (!resultCtx) {
                reject(new Error('Could not get 2D context for result canvas'));
                return;
            }

            // Set the size of the result canvas based on the crop area
            resultCanvas.width = cropArea.width;
            resultCanvas.height = cropArea.height;

            // Draw only the cropped portion to the result canvas
            resultCtx.drawImage(
                tempCanvas,
                cropArea.x, cropArea.y, cropArea.width, cropArea.height,
                0, 0, resultCanvas.width, resultCanvas.height,
            );

            // Convert to data URL
            const croppedImageDataUrl = resultCanvas.toDataURL('image/png');
            resolve(croppedImageDataUrl);
        } catch (error) {
            reject(error);
            notificationService.error(`Error applying crop: ${error}`);
        }
    });
};

/**
 * Initialize default crop area when entering crop mode
 */
export const initializeDefaultCropArea = (canvas: HTMLCanvasElement, image: HTMLImageElement): CropArea => {
    // Default crop will be centered and use 80% of the canvas size
    // while preserving the image aspect ratio
    const canvasAspect = canvas.width / canvas.height;
    const imgAspect = image.width / image.height;

    let cropWidth, cropHeight;

    if (imgAspect > canvasAspect) {
        cropWidth = canvas.width * 0.8;
        cropHeight = cropWidth / imgAspect;
    } else {
        cropHeight = canvas.height * 0.8;
        cropWidth = cropHeight * imgAspect;
    }

    const cropX = (canvas.width - cropWidth) / 2;
    const cropY = (canvas.height - cropHeight) / 2;

    return {
        x: cropX,
        y: cropY,
        width: cropWidth,
        height: cropHeight,
        active: true,
    };
};