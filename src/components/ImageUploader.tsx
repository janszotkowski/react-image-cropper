import React, { useRef, useCallback } from 'react';
import { Upload } from 'lucide-react';
import useImageSafety from '../hooks/useImageSafety';
import { notificationService } from '../service/NotificationService';
import useImageStore from '../store/imageStore';

export const ImageUploader: React.FC = (): React.ReactElement => {
    const [isDragging, setIsDragging] = React.useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { validateAndSanitizeImage, isValidating } = useImageSafety();
    const { setSelectedImage, setSelectedFile, isProcessing, setProcessing, checkFileType, checkFileSize, readFileAsDataURL } = useImageStore();

    // Process file
    const processFile = useCallback(async (file: File): Promise<void> => {
        setProcessing(true);

        try {
            // Validate file type
            if (!checkFileType(file)) {
                notificationService.error('Unsupported file format. Allowed formats are JPG, PNG, WebP, SVG, and GIF.');
                return;
            }

            // Validate file size
            if (!checkFileSize(file)) {
                notificationService.error('File is too large. Maximum size is 5 MB.');
                return;
            }

            // Read file and convert to Data URL
            const dataUrl = await readFileAsDataURL(file);

            // Security validation and sanitization
            const safetyResult = await validateAndSanitizeImage(file, dataUrl);

            if (!safetyResult.isValid) {
                notificationService.error(safetyResult.error || 'Image does not meet security requirements.');
                return;
            }

            // Store the sanitized image
            setSelectedImage(safetyResult.dataUrl || dataUrl);
            setSelectedFile(file);
            notificationService.success('Image successfully uploaded.');
        } catch (err) {
            console.error('Error processing file:', err);
            notificationService.error('An error occurred while loading the file. Please try again.');
        } finally {
            setProcessing(false);
        }
    }, [setProcessing, checkFileType, checkFileSize, validateAndSanitizeImage, setSelectedImage, setSelectedFile, readFileAsDataURL]);

    const stopEventPropagation = useCallback((e: React.DragEvent<HTMLDivElement>): void => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    // Handle drag over event
    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>): void => {
        stopEventPropagation(e);
        setIsDragging(true);
    }, [stopEventPropagation]);

    // Handle drag leave event
    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>): void => {
        stopEventPropagation(e);
        setIsDragging(false);
    }, [stopEventPropagation]);

    // Handle drop event
    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>): void => {
        stopEventPropagation(e);
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            processFile(file);
        }
    }, [processFile, stopEventPropagation]);

    // Handle file input change event
    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            processFile(file);
        }
    }, [processFile]);

    // Handle click on upload button
    const handleUploadClick = useCallback((): void => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    }, []);

    // Check if processing
    const isLoading = isProcessing || isValidating;

    return (
        <div className={'w-full aspect-video'} style={{ maxWidth: '70vw' }}>
            {/* Hidden file input */}
            <input
                type={'file'}
                accept={'image/jpeg,image/jpg,image/png,image/webp,image/svg+xml,image/gif'}
                className={'hidden'}
                ref={fileInputRef}
                onChange={handleFileChange}
                disabled={isLoading}
            />

            {/* Drop zone */}
            <div
                className={`w-full h-full p-8 border-1 rounded-lg flex flex-col items-center justify-center ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                } ${
                    isDragging
                        ? 'border-white'
                        : 'border-gray-800 hover:border-gray-400 transition-all duration-500'
                }`}
                onDragOver={!isLoading ? handleDragOver : undefined}
                onDragLeave={!isLoading ? handleDragLeave : undefined}
                onDrop={!isLoading ? handleDrop : undefined}
                onClick={!isLoading ? handleUploadClick : undefined}
            >
                <Upload size={64} className={'text-gray-400 mb-6'} />

                {isLoading ? (
                    <p className={'text-center text-gray-300 text-xl mb-2'}>
                        Processing image...
                    </p>
                ) : (
                    <>
                        <p className={'text-center text-gray-300 text-xl mb-4'}>
                            Drag and drop an image here or click to upload
                        </p>

                        <p className={'text-center text-gray-500 text-sm mb-1'}>
                            Supported formats: JPG, PNG, WebP, SVG, GIF
                        </p>
                        <p className={'text-center text-gray-500 text-sm'}>
                            Maximum size: 5 MB
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};

export default ImageUploader;