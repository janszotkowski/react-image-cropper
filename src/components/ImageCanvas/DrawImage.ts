// Type for drawing parameters
type DrawImageParams = {
    ctx: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
    image: HTMLImageElement;
    position: { x: number; y: number; };
    scale: number;
    isFlippedHorizontally: boolean;
    isFlippedVertically: boolean;
    rotation: number;
};

// Function for drawing the image with transformations
export const drawImage = ({
    ctx,
    canvas,
    image,
    position,
    scale,
    isFlippedHorizontally,
    isFlippedVertically,
    rotation,
}: DrawImageParams): void => {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate the position and size of the image
    const canvasAspect = canvas.width / canvas.height;
    const imgAspect = image.width / image.height;

    let drawWidth, drawHeight, offsetX, offsetY;

    if (imgAspect > canvasAspect) {
        // Image is wider than the canvas
        drawWidth = canvas.width;
        drawHeight = canvas.width / imgAspect;
        offsetX = 0;
        offsetY = (canvas.height - drawHeight) / 2;
    } else {
        // Image is taller than the canvas
        drawHeight = canvas.height;
        drawWidth = canvas.height * imgAspect;
        offsetX = (canvas.width - drawWidth) / 2;
        offsetY = 0;
    }

    // Apply transformations
    ctx.save();

    // Move to center, apply transformations and move back
    ctx.translate(canvas.width / 2, canvas.height / 2);

    // Apply translation
    ctx.translate(position.x, position.y);

    // Apply rotation
    if (rotation !== 0) {
        ctx.rotate((rotation * Math.PI) / 180);
    }

    // Apply scale and flipping
    ctx.scale(
        scale * (isFlippedHorizontally ? -1 : 1),
        scale * (isFlippedVertically ? -1 : 1),
    );

    // Move back
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // Draw the image
    ctx.drawImage(
        image,
        offsetX,
        offsetY,
        drawWidth,
        drawHeight,
    );

    ctx.restore();
};