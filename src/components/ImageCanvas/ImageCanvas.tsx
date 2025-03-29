import * as React from 'react';
import { drawImage } from './DrawImage';
import { ImageControls } from './ImageControls';
import { useImageStore } from '@/store';
import { ZoomSlider } from './ZoomSlider';
import { drawCropOverlay, useCropInteraction, CropControls } from './CropOverlay';
import { applyCropToImage, initializeDefaultCropArea } from './CropUtils';

export const ImageCanvas: React.FC = (): React.ReactElement => {
    const {
        selectedImage,
        position,
        scale,
        isFlippedHorizontally,
        isFlippedVertically,
        rotation,
        setPosition,
        flipHorizontally,
        flipVertically,
        setScale,
        rotate,
        isCropping,
        cropArea,
        toggleCropMode,
        setCropArea,
        setSelectedImage,
    } = useImageStore();

    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const [startDragPosition, setStartDragPosition] = React.useState({ x: 0, y: 0 });
    const [image, setImage] = React.useState<HTMLImageElement | null>(null);

    // Crop interaction hooks
    const cropInteraction = useCropInteraction(
        canvasRef as React.RefObject<HTMLCanvasElement>,
        cropArea,
        setCropArea,
    );

    // Initialize default crop area when entering crop mode
    React.useEffect(() => {
        if (isCropping && !cropArea.active && canvasRef.current && image) {
            const canvas = canvasRef.current;
            const defaultCropArea = initializeDefaultCropArea(canvas, image);
            setCropArea(defaultCropArea);
        }
    }, [isCropping, cropArea.active, setCropArea, image]);

    // Load image when selectedImage changes
    React.useEffect(() => {
        if (!selectedImage) {
            setImage(null);
            return;
        }

        const img = new Image();
        img.src = selectedImage;
        img.onload = (): void => {
            setImage(img);
        };
    }, [selectedImage]);

    // Draw image when image, position, scale or transformations change
    React.useEffect(() => {
        if (!canvasRef.current || !image) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear the canvas completely
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the image
        drawImage({
            ctx,
            canvas,
            image,
            position,
            scale,
            isFlippedHorizontally,
            isFlippedVertically,
            rotation,
        });

        // Draw crop overlay if in crop mode
        if (isCropping && cropArea.active) {
            drawCropOverlay(ctx, canvas, cropArea);
        }
    }, [image, position, scale, isFlippedHorizontally, isFlippedVertically, rotation, isCropping, cropArea]);

    // Update canvas size when window size changes
    React.useEffect(() => {
        const updateCanvasSize = (): void => {
            if (!canvasRef.current) return;

            const canvas = canvasRef.current;
            const container = canvas.parentElement;
            if (!container) return;

            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;

            // Force redraw after resize
            if (image) {
                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                // Clear canvas first
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                drawImage({
                    ctx,
                    canvas,
                    image,
                    position,
                    scale,
                    isFlippedHorizontally,
                    isFlippedVertically,
                    rotation,
                });

                // Redraw crop overlay if active
                if (isCropping && cropArea.active) {
                    drawCropOverlay(ctx, canvas, cropArea);
                }
            }
        };

        updateCanvasSize();
        window.addEventListener('resize', updateCanvasSize);

        return (): void => {
            window.removeEventListener('resize', updateCanvasSize);
        };
    }, [image, position, scale, isFlippedHorizontally, isFlippedVertically, rotation, isCropping, cropArea]);

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>): void => {
        if (!selectedImage) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        if (isCropping) {
            // Pass event handling to crop functions
            const handled = cropInteraction.handleMouseDown(e);
            if (!handled) {
                // If event wasn't handled by crop functions, use standard image movement
                setIsDragging(true);
                setStartDragPosition({
                    x: e.clientX - position.x,
                    y: e.clientY - position.y,
                });
            }
        } else {
            // Standard image movement mode
            setIsDragging(true);
            setStartDragPosition({
                x: e.clientX - position.x,
                y: e.clientY - position.y,
            });
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>): void => {
        if (isCropping) {
            // In crop mode, delegate mouse movement handling
            cropInteraction.handleMouseMove(e);
            cropInteraction.updateCursor(e);
        } else if (isDragging) {
            // Normal image movement mode
            setPosition({
                x: e.clientX - startDragPosition.x,
                y: e.clientY - startDragPosition.y,
            });
        }
    };

    const handleMouseUp = (): void => {
        if (isCropping) {
            // In crop mode, delegate mouse release handling
            cropInteraction.handleMouseUp();
        }
        setIsDragging(false);
    };

    // Function for applying crop
    const handleApplyCrop = async (): Promise<void> => {
        if (!canvasRef.current || !cropArea.active || !image) return;

        try {
            // Use utility function for cropping
            const croppedImageDataUrl = await applyCropToImage(
                canvasRef.current,
                image,
                cropArea,
                {
                    position,
                    scale,
                    isFlippedHorizontally,
                    isFlippedVertically,
                    rotation,
                },
            );

            // Update the image
            setSelectedImage(croppedImageDataUrl);

            // Reset transformations
            setPosition({ x: 0, y: 0 });
            setScale(1);

            // Exit crop mode
            toggleCropMode();
        } catch (error) {
            console.error('Error applying crop:', error);
        }
    };

    return (
        <div className={'w-full aspect-video'} style={{ maxWidth: '70vw', position: 'relative' }}>
            {
                selectedImage && !isCropping &&
                <ZoomSlider
                    currentScale={scale}
                    onScaleChange={setScale}
                />
            }
            <canvas
                ref={canvasRef}
                className={'w-full h-full bg-black/20 rounded-lg'}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            />

            {
                selectedImage &&
                <ImageControls
                    onFlipHorizontal={flipHorizontally}
                    onFlipVertical={flipVertically}
                    onRotateClockwise={() => rotate(90)}
                    onRotateCounterClockwise={() => rotate(-90)}
                    onToggleCrop={toggleCropMode}
                    isCropping={isCropping}
                />
            }

            {
                isCropping && cropArea.active &&
                <CropControls
                    cropArea={cropArea}
                    onCropAreaChange={setCropArea}
                    onApplyCrop={handleApplyCrop}
                    onCancelCrop={toggleCropMode}
                />
            }
        </div>
    );
};

export default ImageCanvas;