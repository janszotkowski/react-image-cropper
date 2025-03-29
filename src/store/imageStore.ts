import { notificationService } from '@/service';
import { create } from 'zustand';

export type Position = {
    x: number;
    y: number;
};

export type CropArea = {
    x: number;
    y: number;
    width: number;
    height: number;
    active: boolean;
};

export type ImageState = {
    selectedImage: string | undefined;
    selectedFile: File | undefined;
    fileName: string | undefined;
    isProcessing: boolean;
    position: Position;
    scale: number;
    isFlippedHorizontally: boolean;
    isFlippedVertically: boolean;
    rotation: number;
    cropArea: CropArea;
    isCropping: boolean;
    setSelectedImage: (image: string | undefined) => void;
    setSelectedFile: (file: File | undefined) => void;
    setFileName: (name: string) => void;
    setProcessing: (isProcessing: boolean) => void;
    setPosition: (position: Position) => void;
    setScale: (scale: number) => void;
    flipHorizontally: () => void;
    flipVertically: () => void;
    rotate: (degrees: number) => void;
    toggleCropMode: () => void;
    setCropArea: (area: Partial<CropArea>) => void;
    resetCropArea: () => void;
    applyCrop: (canvas: HTMLCanvasElement, area?: CropArea) => Promise<void>;
    checkFileType: (file: File) => boolean;
    checkFileSize: (file: File) => boolean;
    readFileAsDataURL: (file: File) => Promise<string>;
    downloadImage: (canvas: HTMLCanvasElement | null) => void;
    reset: () => void;
};

// Allowed image types
const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/svg+xml',
    'image/gif',
];

// Maximum file size in bytes (5 MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const useImageStore = create<ImageState>((set, get) => ({
    selectedImage: undefined,
    selectedFile: undefined,
    fileName: '',
    isProcessing: false,
    position: { x: 0, y: 0 },
    scale: 1,
    isFlippedHorizontally: false,
    isFlippedVertically: false,
    rotation: 0,
    cropArea: { x: 0, y: 0, width: 0, height: 0, active: false },
    isCropping: false,
    setSelectedImage: (image): void => set({ selectedImage: image }),

    setSelectedFile: (file): void => {
        if (file) {
            set({
                selectedFile: file,
                fileName: file.name,
            });
        } else {
            set({ selectedFile: undefined });
        }
    },

    setFileName: (name): void => set({ fileName: name }),

    setProcessing: (isProcessing): void => set({ isProcessing }),

    setPosition: (position): void => set({ position }),

    setScale: (scale): void => set({ scale }),

    flipHorizontally: (): void => set((state) => ({ isFlippedHorizontally: !state.isFlippedHorizontally })),

    flipVertically: (): void => set((state) => ({ isFlippedVertically: !state.isFlippedVertically })),

    rotate: (degrees): void => set((state) => ({ rotation: (state.rotation + degrees) % 360 })),

    toggleCropMode: (): void => set((state) => {
        // If we're exiting crop mode, reset the crop area
        if (state.isCropping) {
            return {
                isCropping: false,
                cropArea: { ...state.cropArea, active: false },
            };
        }
        return { isCropping: true };
    }),

    setCropArea: (area): void => set((state) => ({
        cropArea: { ...state.cropArea, ...area },
    })),

    resetCropArea: (): void => set({
        cropArea: { x: 0, y: 0, width: 0, height: 0, active: false },
    }),

    applyCrop: async (canvas, area): Promise<void> => {
        const { cropArea: storeCropArea, selectedFile, setSelectedImage, setProcessing } = get();

        // Use provided area or fallback to store's cropArea
        const cropArea = area || storeCropArea;

        // Check if crop area is active
        if (!cropArea.active || !canvas) return;

        try {
            setProcessing(true);

            // Create a new canvas for the cropped area
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            if (!tempCtx) throw new Error('Could not get 2D context');

            // Set the size of the new canvas
            tempCanvas.width = cropArea.width;
            tempCanvas.height = cropArea.height;

            // Copy the cropped area to the new canvas
            tempCtx.drawImage(
                canvas,
                cropArea.x, cropArea.y, cropArea.width, cropArea.height,
                0, 0, cropArea.width, cropArea.height,
            );

            // Convert to Data URL
            const originalType = selectedFile?.type || 'image/png';
            const croppedImageDataUrl = tempCanvas.toDataURL(originalType);

            // Update the image
            setSelectedImage(croppedImageDataUrl);

            // Reset transformations
            set({
                position: { x: 0, y: 0 },
                scale: 1,
                isFlippedHorizontally: false,
                isFlippedVertically: false,
                rotation: 0,
            });
        } catch (error) {
            console.error('Error applying crop:', error);
        } finally {
            setProcessing(false);
        }
    },

    checkFileType: (file): boolean => ALLOWED_IMAGE_TYPES.includes(file.type),

    checkFileSize: (file): boolean => file.size <= MAX_FILE_SIZE,

    readFileAsDataURL: (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e): void => {
                const result = e.target?.result;
                if (typeof result === 'string') {
                    resolve(result);
                } else {
                    notificationService.error('Failed to load file as Data URL.');
                    reject(new Error('Failed to load file as Data URL.'));
                }
            };
            reader.onerror = (): void => {
                notificationService.error('Error reading file.');
                reject(new Error('Error reading file.'));
            };
            reader.readAsDataURL(file);
        });
    },

    downloadImage: (canvas: HTMLCanvasElement | null): void => {
        const { selectedFile, fileName } = get();

        try {
            let dataUrl: string | null = null;
            let mimeType = selectedFile?.type ?? 'image/png';

            if (canvas) {
                dataUrl = canvas.toDataURL(mimeType);
            } else if (get().selectedImage) {
                dataUrl = get().selectedImage as string;

                if (dataUrl.startsWith('data:')) {
                    const typeMatch = dataUrl.match(/^data:(image\/[a-z0-9+.-]+);/i);
                    if (typeMatch && typeMatch[1]) {
                        mimeType = typeMatch[1];
                    }
                }
            }

            if (!dataUrl) {
                notificationService.error('No image data available');
                return;
            }

            // Get file extension
            const extension = mimeType.split('/')[1] ?? (selectedFile?.name.split('.').pop() ?? 'png');

            // Add extension if needed
            const fileNameWithExt = fileName?.includes('.') ? fileName : `${fileName ?? 'image'}.${extension}`;

            // Create and setup download link
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = fileNameWithExt;
            link.setAttribute('download', fileNameWithExt);

            // Append to DOM, trigger download and clean up
            document.body.appendChild(link);
            link.click();

            setTimeout(() => {
                document.body.removeChild(link);
            }, 100);
        } catch (error) {
            notificationService.error(`Error downloading image: ${error}`);
        }
    },

    reset: (): void => set({
        selectedImage: undefined,
        selectedFile: undefined,
        fileName: undefined,
        position: { x: 0, y: 0 },
        scale: 1,
        isFlippedHorizontally: false,
        isFlippedVertically: false,
        rotation: 0,
        cropArea: { x: 0, y: 0, width: 0, height: 0, active: false },
        isCropping: false,
    }),
}));

export default useImageStore;