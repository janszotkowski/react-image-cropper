import * as React from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';

type ZoomSliderProps = {
    currentScale: number;
    onScaleChange: (scale: number) => void;
};

// Limiting scale to range 0.1 to 10 (10% to 1000%)
const MIN_SCALE = 0.1;
const MAX_SCALE = 10;

export const ZoomSlider: React.FC<ZoomSliderProps> = ({
    currentScale,
    onScaleChange,
}): React.ReactElement => {
    const [isDragging, setIsDragging] = React.useState(false);
    const sliderRef = React.useRef<HTMLDivElement>(null);

    // Current position of the slider handle
    const getSliderPosition = React.useCallback((): number => {
        // Convert from scale (0.1 to 10) to position (0 to 100%)
        const range = MAX_SCALE - MIN_SCALE;
        const normalizedScale = (currentScale - MIN_SCALE) / range;
        return 100 - (normalizedScale * 100); // Inversion for visual representation
    }, [currentScale]);

    // Direct interpretation of mouse position on the slider
    const handleSliderPosition = React.useCallback((clientY: number): void => {
        if (!sliderRef.current) return;

        const rect = sliderRef.current.getBoundingClientRect();
        const sliderHeight = rect.height;
        const relativeY = clientY - rect.top;

        // Convert position to percentage value (0-100%)
        const percentPosition = Math.max(0, Math.min(100, (relativeY / sliderHeight) * 100));

        // Convert percentage value to scale (0.1-10)
        const range = MAX_SCALE - MIN_SCALE;
        const newScale = MAX_SCALE - (percentPosition / 100) * range;

        onScaleChange(newScale);
    }, [onScaleChange]);

    const handleMouseMove = React.useCallback((e: MouseEvent): void => {
        if (!isDragging) return;
        e.preventDefault();
        // Using mouse position directly to calculate new value
        handleSliderPosition(e.clientY);
    }, [isDragging, handleSliderPosition]);

    const handleMouseUp = React.useCallback((): void => {
        setIsDragging(false);
    }, []);

    // Processing scale change during drag
    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>): void => {
        e.preventDefault();
        setIsDragging(true);
        // Immediately set position based on click location
        handleSliderPosition(e.clientY);
    };

    React.useEffect((): (() => void) => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
        return (): void => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    const handleZoomIn = (): void => {
        const newScale = Math.min(MAX_SCALE, currentScale + 0.1);
        onScaleChange(newScale);
    };

    const handleZoomOut = (): void => {
        const newScale = Math.max(MIN_SCALE, currentScale - 0.1);
        onScaleChange(newScale);
    };

    return (
        <div className={'absolute -right-10 top-1/2 transform -translate-y-1/2 flex flex-col items-center ml-4 h-full justify-center'}>
            <button
                onClick={handleZoomIn}
                className={'w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition-colors cursor-pointer mb-3'}
                title={'Zoom In'}
            >
                <ZoomIn size={16} />
            </button>

            <div
                className={'h-44 w-2 bg-black/10 rounded-full relative cursor-grab active:cursor-grabbing'}
                ref={sliderRef}
                onMouseDown={handleMouseDown}
            >
                {/* Thin div representing the slider path - added as decorative element */}
                <div className={'absolute h-full w-0.5 left-1/2 transform -translate-x-1/2 bg-black/5'}></div>

                {/* Marks on the slider path */}
                <div className={'absolute w-1.5 h-0.5 bg-white/50 left-1/2 transform -translate-x-1/2'} style={{ top: '0%' }}></div>
                <div className={'absolute w-1.5 h-0.5 bg-white/50 left-1/2 transform -translate-x-1/2'} style={{ top: '25%' }}></div>
                <div className={'absolute w-1.5 h-0.5 bg-white/50 left-1/2 transform -translate-x-1/2'} style={{ top: '50%' }}></div>
                <div className={'absolute w-1.5 h-0.5 bg-white/50 left-1/2 transform -translate-x-1/2'} style={{ top: '75%' }}></div>
                <div className={'absolute w-1.5 h-0.5 bg-white/50 left-1/2 transform -translate-x-1/2'} style={{ top: '100%' }}></div>

                <div className={'absolute h-full w-full rounded-full overflow-hidden'}>
                    <div
                        className={'absolute bottom-0 left-0 right-0 bg-black/40'}
                        style={{ height: `${100 - getSliderPosition()}%` }}
                    />
                </div>

                <div
                    className={'absolute h-4 w-4 -left-1 transform -translate-x-0 -translate-y-1/2 z-10'}
                    style={{ top: `${getSliderPosition()}%` }}
                >
                    <div className={'h-full w-full bg-white rounded-full shadow-md'}></div>
                </div>

                <div className={'absolute -right-10 top-1/2 transform -translate-y-1/2 text-xs text-white/60 font-medium'}>
                    {Math.round(currentScale * 100)}%
                </div>
            </div>

            <button
                onClick={handleZoomOut}
                className={'w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition-colors cursor-pointer mt-3'}
                title={'Zoom Out'}
            >
                <ZoomOut size={16} />
            </button>
        </div>
    );
};
