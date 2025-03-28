import { create } from 'zustand';

export type Position = {
    x: number;
    y: number;
};

export type ImageState = {
    selectedImage: string | undefined;
    selectedFile: File | undefined;
    customFileName: string | undefined;
    isProcessing: boolean;
    position: Position;
    scale: number;
    setSelectedImage: (image: string | undefined) => void;
    setSelectedFile: (file: File | undefined) => void;
    setCustomFileName: (name: string) => void;
    setProcessing: (isProcessing: boolean) => void;
    setPosition: (position: Position) => void;
    setScale: (scale: number) => void;
    checkFileType: (file: File) => boolean;
    checkFileSize: (file: File) => boolean;
    readFileAsDataURL: (file: File) => Promise<string>;
    downloadImage: () => void;
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
    customFileName: '',
    isProcessing: false,
    position: { x: 0, y: 0 },
    scale: 1,
    setSelectedImage: (image): void => set({ selectedImage: image }),

    setSelectedFile: (file): void => {
        if (file) {
            set({
                selectedFile: file,
                customFileName: file.name,
            });
        } else {
            set({ selectedFile: undefined });
        }
    },

    setCustomFileName: (name): void => set({ customFileName: name }),

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

    downloadImage: (): void => {
        const { selectedImage, customFileName, selectedFile } = get();
        if (selectedImage && selectedFile) {
            const link = document.createElement('a');
            link.href = selectedImage;

            // Get file extension from the original file
            const extension = selectedFile.name.split('.').pop() || '';

            // Add extension if the custom filename doesn't have it
            const fileName = customFileName?.includes('.') ? customFileName : `${customFileName}.${extension}`;

            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    },

    reset: (): void => set({
        selectedImage: undefined,
        selectedFile: undefined,
        customFileName: undefined,
        position: { x: 0, y: 0 },
        scale: 1,
    }),
}));

export default useImageStore;