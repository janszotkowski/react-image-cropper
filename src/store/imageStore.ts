import { create } from 'zustand';

export type Position = {
    x: number;
    y: number;
};

export type ImageState = {
    selectedImage: string | null;
    selectedFile: File | null;
    isProcessing: boolean;
    position: Position;
    scale: number;
    setSelectedImage: (image: string | null) => void;
    setSelectedFile: (file: File | null) => void;
    setProcessing: (isProcessing: boolean) => void;
    setPosition: (position: Position) => void;
    setScale: (scale: number) => void;
    checkFileType: (file: File) => boolean;
    checkFileSize: (file: File) => boolean;
    readFileAsDataURL: (file: File) => Promise<string>;
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

export const useImageStore = create<ImageState>((set) => ({
    selectedImage: null,
    selectedFile: null,
    isProcessing: false,
    position: { x: 0, y: 0 },
    scale: 1,
    setSelectedImage: (image): void => set({ selectedImage: image }),

    setSelectedFile: (file): void => set({ selectedFile: file }),

    setProcessing: (isProcessing): void => set({ isProcessing }),

    setPosition: (position): void => set({ position }),

    setScale: (scale): void => set({ scale }),

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
                    reject(new Error('Failed to load file as Data URL.'));
                }
            };
            reader.onerror = (): void => {
                reject(new Error('Error reading file.'));
            };
            reader.readAsDataURL(file);
        });
    },

    reset: (): void => set({
        selectedImage: null,
        selectedFile: null,
        position: { x: 0, y: 0 },
        scale: 1,
    }),
}));

export default useImageStore;