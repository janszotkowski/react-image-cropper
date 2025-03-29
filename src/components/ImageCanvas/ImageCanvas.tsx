import * as React from 'react';
import { drawImage } from './DrawImage';
import { ImageControls } from './ImageControls';
import { useImageStore } from '@/store';

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
        rotate,
    } = useImageStore();

    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const [startDragPosition, setStartDragPosition] = React.useState({ x: 0, y: 0 });
    const [image, setImage] = React.useState<HTMLImageElement | null>(null);

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
    }, [image, position, scale, isFlippedHorizontally, isFlippedVertically, rotation]);

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
            }
        };

        updateCanvasSize();
        window.addEventListener('resize', updateCanvasSize);

        return (): void => {
            window.removeEventListener('resize', updateCanvasSize);
        };
    }, [image, position, scale, isFlippedHorizontally, isFlippedVertically, rotation]);

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>): void => {
        if (!selectedImage) return;

        setIsDragging(true);
        setStartDragPosition({
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        });
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>): void => {
        if (!isDragging) return;

        setPosition({
            x: e.clientX - startDragPosition.x,
            y: e.clientY - startDragPosition.y,
        });
    };

    const handleMouseUp = (): void => {
        setIsDragging(false);
    };

    return (
        <div className={'w-full aspect-video'} style={{ maxWidth: '70vw', position: 'relative' }}>
            <canvas
                ref={canvasRef}
                className={'w-full h-full bg-black/20 rounded-lg'}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            />

            {selectedImage && <ImageControls
                onFlipHorizontal={flipHorizontally}
                onFlipVertical={flipVertically}
                onRotateClockwise={() => rotate(90)}
                onRotateCounterClockwise={() => rotate(-90)}
            />}
        </div>
    );
};

export default ImageCanvas;