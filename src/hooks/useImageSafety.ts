import { useState, useCallback } from 'react';

// Types of safety validation results
export type ImageSafetyResult = {
    isValid: boolean;
} & Partial<{
    error: string;
    dataUrl: string;
}>;

/**
 * Hook to ensure security of uploaded images
 * Performs advanced security checks and sanitization
 */
export const useImageSafety = (): {
    validateAndSanitizeImage: (file: File, dataUrl: string) => Promise<ImageSafetyResult>;
    isValidating: boolean;
} => {
    const [isValidating, setIsValidating] = useState<boolean>(false);

    /**
     * Validates and sanitizes the uploaded image
     * @param file Image file
     * @param dataUrl Data URL of the image
     */
    const validateAndSanitizeImage = useCallback(
        async (file: File, dataUrl: string): Promise<ImageSafetyResult> => {
            setIsValidating(true);

            try {
                // Basic MIME type check
                if (!file.type.startsWith('image/')) {
                    return {
                        isValid: false,
                        error: 'The file is not a valid image.',
                    };
                }

                // Magic bytes check (file signature)
                const isValidImage = await validateImageSignature(file);
                if (!isValidImage) {
                    return {
                        isValid: false,
                        error: 'The file has an invalid signature and may be dangerous.',
                    };
                }

                // Image sanitization using Canvas API
                const sanitizedDataUrl = await sanitizeImage(dataUrl);

                return {
                    isValid: true,
                    dataUrl: sanitizedDataUrl,
                };
            } catch (error) {
                console.error('Error during image validation:', error);
                return {
                    isValid: false,
                    error: 'An unexpected error occurred while processing the image.',
                };
            } finally {
                setIsValidating(false);
            }
        },
        [],
    );

    return {
        validateAndSanitizeImage,
        isValidating,
    };
};

/**
 * Validates file signature to verify it's a genuine image
 * @param file Image file
 */
const validateImageSignature = async (file: File): Promise<boolean> => {
    // Reading the first bytes of the file to check the signature
    const arrayBuffer = await file.slice(0, 4).arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const signature = Array.from(uint8Array).map(byte => byte.toString(16).padStart(2, '0')).join('');

    // Check known image signatures
    // JPEG: ffd8ffe0, ffd8ffe1, ffd8ffe2
    // PNG: 89504e47
    // GIF: 47494638
    // WebP: 52494646 (RIFF)...57454250 (WEBP)
    const validSignatures = [
        'ffd8ff', // JPEG
        '89504e47', // PNG
        '47494638', // GIF
        '52494646', // WEBP (RIFF...)
    ];

    return validSignatures.some(validSig => signature.startsWith(validSig));
};

/**
 * Sanitizes the image by redrawing it on canvas, removing potentially harmful content
 * @param dataUrl Data URL of the image
 */
const sanitizeImage = (dataUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = (): void => {
            // Create a canvas for sanitization
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                reject(new Error('Canvas context is not available.'));
                return;
            }

            // Set canvas dimensions
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;

            // Render the image to canvas, effectively removing scripts and metadata
            ctx.drawImage(img, 0, 0);

            // Convert back to data URL
            const sanitizedDataUrl = canvas.toDataURL(
                'image/png', // Convert to safe format
                0.9, // Quality
            );

            resolve(sanitizedDataUrl);
        };

        img.onerror = (): void => {
            reject(new Error('Failed to load image for sanitization.'));
        };

        // Set crossOrigin for security
        img.crossOrigin = 'anonymous';
        img.src = dataUrl;
    });
};

export default useImageSafety;