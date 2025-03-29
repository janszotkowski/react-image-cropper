import * as React from 'react';
import { CropArea } from '@/store';
import { Check, X } from 'lucide-react';

type Corner = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'none';

type CropOverlayProps = {
    cropArea: CropArea;
    onCropAreaChange: (area: Partial<CropArea>) => void;
    onApplyCrop: () => void;
    onCancelCrop: () => void;
};

export const drawCropOverlay = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, area: CropArea): void => {
    if (!area.active) return;

    // Round coordinates to whole pixels for sharp edges
    const x = Math.round(area.x);
    const y = Math.round(area.y);
    const width = Math.round(area.width);
    const height = Math.round(area.height);

    // Save the current canvas state
    ctx.save();

    // Draw the semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';

    // Draw four rectangles around the crop area
    // Top rectangle
    ctx.fillRect(0, 0, canvas.width, y);

    // Left rectangle
    ctx.fillRect(0, y, x, height);

    // Right rectangle
    ctx.fillRect(x + width, y, canvas.width - (x + width), height);

    // Bottom rectangle
    ctx.fillRect(0, y + height, canvas.width, canvas.height - (y + height));

    // Use crisp lines setting
    ctx.imageSmoothingEnabled = false;

    // Draw crop rectangle border - use integer offset for crisp lines
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;

    // Draw each line separately for precision
    // Top line
    ctx.beginPath();
    ctx.moveTo(x, y + 0.5);
    ctx.lineTo(x + width, y + 0.5);
    ctx.stroke();

    // Right line
    ctx.beginPath();
    ctx.moveTo(x + width - 0.5, y);
    ctx.lineTo(x + width - 0.5, y + height);
    ctx.stroke();

    // Bottom line
    ctx.beginPath();
    ctx.moveTo(x, y + height - 0.5);
    ctx.lineTo(x + width, y + height - 0.5);
    ctx.stroke();

    // Left line
    ctx.beginPath();
    ctx.moveTo(x + 0.5, y);
    ctx.lineTo(x + 0.5, y + height);
    ctx.stroke();

    // Draw handles at corners for resizing with sharp edges
    const handleSize = 8;
    ctx.fillStyle = '#ffffff';

    // Top-left handle
    ctx.fillRect(Math.round(x - handleSize / 2), Math.round(y - handleSize / 2), handleSize, handleSize);

    // Top-right handle
    ctx.fillRect(Math.round(x + width - handleSize / 2), Math.round(y - handleSize / 2), handleSize, handleSize);

    // Bottom-left handle
    ctx.fillRect(Math.round(x - handleSize / 2), Math.round(y + height - handleSize / 2), handleSize, handleSize);

    // Bottom-right handle
    ctx.fillRect(Math.round(x + width - handleSize / 2), Math.round(y + height - handleSize / 2), handleSize, handleSize);

    // Restore the canvas state
    ctx.restore();
};

export const getHoveredCorner = (x: number, y: number, cropArea: CropArea): Corner => {
    if (!cropArea.active) return 'none';

    const handleSize = 20; // Larger than visual size for easier grabbing

    // Check all corners
    if (Math.abs(x - cropArea.x) <= handleSize / 2 && Math.abs(y - cropArea.y) <= handleSize / 2) {
        return 'topLeft';
    }

    if (Math.abs(x - (cropArea.x + cropArea.width)) <= handleSize / 2 &&
        Math.abs(y - cropArea.y) <= handleSize / 2) {
        return 'topRight';
    }

    if (Math.abs(x - cropArea.x) <= handleSize / 2 &&
        Math.abs(y - (cropArea.y + cropArea.height)) <= handleSize / 2) {
        return 'bottomLeft';
    }

    if (Math.abs(x - (cropArea.x + cropArea.width)) <= handleSize / 2 &&
        Math.abs(y - (cropArea.y + cropArea.height)) <= handleSize / 2) {
        return 'bottomRight';
    }

    // Check if inside crop area
    if (x >= cropArea.x && x <= cropArea.x + cropArea.width &&
        y >= cropArea.y && y <= cropArea.y + cropArea.height) {
        return 'none'; // Inside area but not on a corner
    }

    return 'none';
};

export const useCropInteraction = (canvasRef: React.RefObject<HTMLCanvasElement>, cropArea: CropArea, onCropAreaChange: (area: Partial<CropArea>) => void): {
    handleMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => boolean;
    handleMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
    handleMouseUp: () => void;
    updateCursor: (e: React.MouseEvent<HTMLCanvasElement>) => void;
} => {
    const [isMovingCrop, setIsMovingCrop] = React.useState(false);
    const [isResizingCrop, setIsResizingCrop] = React.useState(false);
    const [activeCorner, setActiveCorner] = React.useState<Corner>('none');
    const [cropStartPosition, setCropStartPosition] = React.useState({ x: 0, y: 0 });
    const [lastCropPosition, setLastCropPosition] = React.useState({ x: 0, y: 0 });
    const [lastCropSize, setLastCropSize] = React.useState({ width: 0, height: 0 });

    // Set cursor based on position over crop area
    const updateCursor = (e: React.MouseEvent<HTMLCanvasElement>): void => {
        if (!cropArea.active || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const corner = getHoveredCorner(x, y, cropArea);

        switch (corner) {
            case 'topLeft':
            case 'bottomRight':
                canvas.style.cursor = 'nwse-resize';
                break;
            case 'topRight':
            case 'bottomLeft':
                canvas.style.cursor = 'nesw-resize';
                break;
            case 'none':
                // Check if we're inside the area
                if (x >= cropArea.x && x <= cropArea.x + cropArea.width &&
                    y >= cropArea.y && y <= cropArea.y + cropArea.height) {
                    canvas.style.cursor = 'move';
                } else {
                    canvas.style.cursor = 'default';
                }
                break;
            default:
                canvas.style.cursor = 'default';
        }
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>): boolean => {
        const canvas = canvasRef.current;
        if (!canvas || !cropArea.active) return false;

        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const corner = getHoveredCorner(mouseX, mouseY, cropArea);

        if (corner !== 'none') {
            // Start resizing
            setIsResizingCrop(true);
            setActiveCorner(corner);
            setCropStartPosition({ x: mouseX, y: mouseY });
            setLastCropPosition({
                x: cropArea.x,
                y: cropArea.y,
            });
            setLastCropSize({
                width: cropArea.width,
                height: cropArea.height,
            });
            return true;
        } else if (mouseX >= cropArea.x && mouseX <= cropArea.x + cropArea.width &&
            mouseY >= cropArea.y && mouseY <= cropArea.y + cropArea.height) {
            // Start moving entire crop area
            setIsMovingCrop(true);
            setCropStartPosition({ x: mouseX, y: mouseY });
            setLastCropPosition({
                x: cropArea.x,
                y: cropArea.y,
            });
            return true;
        }

        return false;
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>): void => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Update cursor
        updateCursor(e);

        if (!isMovingCrop && !isResizingCrop) return;

        if (isResizingCrop && activeCorner !== 'none') {
            // Precise corner placement based on mouse position
            let newX = cropArea.x;
            let newY = cropArea.y;
            let newWidth = cropArea.width;
            let newHeight = cropArea.height;

            switch (activeCorner) {
                case 'topLeft':
                    // Top-left corner must be directly at mouse position
                    newX = mouseX;
                    newY = mouseY;
                    newWidth = lastCropPosition.x + lastCropSize.width - mouseX;
                    newHeight = lastCropPosition.y + lastCropSize.height - mouseY;
                    break;
                case 'topRight':
                    // Top-right corner controls width and y position (top edge)
                    newY = mouseY;
                    newWidth = mouseX - lastCropPosition.x;
                    newHeight = lastCropPosition.y + lastCropSize.height - mouseY;
                    break;
                case 'bottomLeft':
                    // Bottom-left corner controls height and x position (left edge)
                    newX = mouseX;
                    newWidth = lastCropPosition.x + lastCropSize.width - mouseX;
                    newHeight = mouseY - lastCropPosition.y;
                    break;
                case 'bottomRight':
                    // Bottom-right corner controls right and bottom edges (width and height)
                    newWidth = mouseX - lastCropPosition.x;
                    newHeight = mouseY - lastCropPosition.y;
                    break;
            }

            // Protection against negative dimensions
            if (newWidth < 20) {
                // Switch corners to maintain mouse position
                switch (activeCorner) {
                    case 'topLeft':
                        setActiveCorner('topRight');
                        newX = lastCropPosition.x + lastCropSize.width;
                        newWidth = 20;
                        break;
                    case 'bottomLeft':
                        setActiveCorner('bottomRight');
                        newX = lastCropPosition.x + lastCropSize.width;
                        newWidth = 20;
                        break;
                    default:
                        newWidth = 20;
                }
            }

            if (newHeight < 20) {
                // Switch corners to maintain mouse position
                switch (activeCorner) {
                    case 'topLeft':
                        setActiveCorner('bottomLeft');
                        newY = lastCropPosition.y + lastCropSize.height;
                        newHeight = 20;
                        break;
                    case 'topRight':
                        setActiveCorner('bottomRight');
                        newY = lastCropPosition.y + lastCropSize.height;
                        newHeight = 20;
                        break;
                    default:
                        newHeight = 20;
                }
            }

            // Keep selection within canvas bounds
            const maxWidth = canvas.width - newX;
            const maxHeight = canvas.height - newY;

            if (newX < 0) newX = 0;
            if (newY < 0) newY = 0;
            if (newWidth > maxWidth) newWidth = maxWidth;
            if (newHeight > maxHeight) newHeight = maxHeight;

            onCropAreaChange({
                x: newX,
                y: newY,
                width: newWidth,
                height: newHeight,
                active: true,
            });
        } else if (isMovingCrop) {
            // Moving the entire crop area
            const deltaX = mouseX - cropStartPosition.x;
            const deltaY = mouseY - cropStartPosition.y;

            // Ensure area doesn't go outside canvas
            let newX = lastCropPosition.x + deltaX;
            let newY = lastCropPosition.y + deltaY;

            if (newX < 0) newX = 0;
            if (newY < 0) newY = 0;
            if (newX + cropArea.width > canvas.width) newX = canvas.width - cropArea.width;
            if (newY + cropArea.height > canvas.height) newY = canvas.height - cropArea.height;

            onCropAreaChange({
                x: newX,
                y: newY,
                width: cropArea.width,
                height: cropArea.height,
                active: true,
            });
        }
    };

    const handleMouseUp = (): void => {
        setIsMovingCrop(false);
        setIsResizingCrop(false);
        setActiveCorner('none');
    };

    return {
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        updateCursor,
    };
};

export const CropControls: React.FC<CropOverlayProps> = (props: CropOverlayProps): React.ReactElement => (
    <div className={'absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1.5'}>
        <button
            onClick={props.onCancelCrop}
            className={'w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors cursor-pointer'}
            title={'Cancel crop'}
        >
            <X size={16} />
        </button>
        <button
            onClick={props.onApplyCrop}
            className={'w-8 h-8 bg-green-800/80 hover:bg-green-700 rounded-full flex items-center justify-center text-white transition-colors cursor-pointer'}
            title={'Apply crop'}
        >
            <Check size={16} />
        </button>
    </div>
);

export default {
    drawCropOverlay,
    getHoveredCorner,
    useCropInteraction,
    CropControls,
};