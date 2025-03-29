import * as React from 'react';
import { useImageStore } from '@/store';

export const ImageCanvas: React.FC = (): React.ReactElement => {
    const { selectedImage, position, scale, setPosition } = useImageStore();
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

    // Render image on canvas when image, position or scale changes
    React.useEffect(() => {
        if (!canvasRef.current || !image) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Calculate position and size of the image
        const canvasAspect = canvas.width / canvas.height;
        const imgAspect = image.width / image.height;

        let drawWidth, drawHeight, offsetX, offsetY;

        if (imgAspect > canvasAspect) {
            // Image is wider than canvas
            drawWidth = canvas.width;
            drawHeight = canvas.width / imgAspect;
            offsetX = 0;
            offsetY = (canvas.height - drawHeight) / 2;
        } else {
            // Image is taller than canvas
            drawHeight = canvas.height;
            drawWidth = canvas.height * imgAspect;
            offsetX = (canvas.width - drawWidth) / 2;
            offsetY = 0;
        }

        // Apply transformations
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.translate(position.x, position.y);
        ctx.scale(scale, scale);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);

        // Draw image
        ctx.drawImage(
            image,
            offsetX,
            offsetY,
            drawWidth,
            drawHeight,
        );

        ctx.restore();
    }, [image, position, scale]);

    // Update canvas size when window size changes
    React.useEffect(() => {
        const updateCanvasSize = (): void => {
            if (!canvasRef.current) return;

            const canvas = canvasRef.current;
            const container = canvas.parentElement;
            if (!container) return;

            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;

            // Redraw after resize
            if (image) {
                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                ctx.clearRect(0, 0, canvas.width, canvas.height);

                const canvasAspect = canvas.width / canvas.height;
                const imgAspect = image.width / image.height;

                let drawWidth, drawHeight, offsetX, offsetY;

                if (imgAspect > canvasAspect) {
                    drawWidth = canvas.width;
                    drawHeight = canvas.width / imgAspect;
                    offsetX = 0;
                    offsetY = (canvas.height - drawHeight) / 2;
                } else {
                    drawHeight = canvas.height;
                    drawWidth = canvas.height * imgAspect;
                    offsetX = (canvas.width - drawWidth) / 2;
                    offsetY = 0;
                }

                ctx.save();
                ctx.translate(canvas.width / 2, canvas.height / 2);
                ctx.translate(position.x, position.y);
                ctx.scale(scale, scale);
                ctx.translate(-canvas.width / 2, -canvas.height / 2);

                ctx.drawImage(
                    image,
                    offsetX,
                    offsetY,
                    drawWidth,
                    drawHeight,
                );

                ctx.restore();
            }
        };

        updateCanvasSize();
        window.addEventListener('resize', updateCanvasSize);

        return (): void => {
            window.removeEventListener('resize', updateCanvasSize);
        };
    }, [image, position, scale]);

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
        </div>
    );
};
