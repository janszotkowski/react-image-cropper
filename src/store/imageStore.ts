import { create } from 'zustand';

export type ImageState = {
    selectedImage: string | null;
    selectedFile: File | null;
    isProcessing: boolean;
    setSelectedImage: (image: string | null) => void;
    setSelectedFile: (file: File | null) => void;
    setProcessing: (isProcessing: boolean) => void;
    reset: () => void;
};

export const useImageStore = create<ImageState>((set) => ({
    selectedImage: null,
    selectedFile: null,
    isProcessing: false,
    setSelectedImage: (image): void => set({ selectedImage: image }),
    setSelectedFile: (file): void => set({ selectedFile: file }),
    setProcessing: (isProcessing): void => set({ isProcessing }),
    reset: (): void => set({ selectedImage: null, selectedFile: null }),
}));

export default useImageStore;