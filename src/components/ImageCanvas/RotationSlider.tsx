import * as React from 'react';
import { RotateCcw, RotateCw } from 'lucide-react';

type RotationSliderProps = {
    currentRotation: number;
    onRotationChange: (rotation: number) => void;
};

// Rotation limits: 0 to 360 degrees
const MIN_ROTATION = 0;
const MAX_ROTATION = 360;

export const RotationSlider: React.FC<RotationSliderProps> = (props: RotationSliderProps): React.ReactElement => {
    const [isDragging, setIsDragging] = React.useState(false);
    const sliderRef = React.useRef<HTMLDivElement>(null);

    // Current position of the slider handle
    const getSliderPosition = React.useCallback((): number => {
        // Convert from rotation (0 to 360) to position (0 to 100%)
        const range = MAX_ROTATION - MIN_ROTATION;
        const normalizedRotation = (props.currentRotation - MIN_ROTATION) / range;
        return normalizedRotation * 100;
    }, [props.currentRotation]);

    // Direct interpretation of mouse position on the slider
    const handleSliderPosition = React.useCallback((clientY: number): void => {
        if (!sliderRef.current) return;

        const rect = sliderRef.current.getBoundingClientRect();
        const sliderHeight = rect.height;
        const relativeY = clientY - rect.top;

        // Convert position to percentage value (0-100%)
        const percentPosition = Math.max(0, Math.min(100, (relativeY / sliderHeight) * 100));

        // Convert percentage value to rotation (0-360)
        const range = MAX_ROTATION - MIN_ROTATION;
        const newRotation = (percentPosition / 100) * range;

        props.onRotationChange(newRotation);
    }, [props]);

    const handleMouseMove = React.useCallback((e: MouseEvent): void => {
        if (!isDragging) return;
        e.preventDefault();
        // Using mouse position directly to calculate new value
        handleSliderPosition(e.clientY);
    }, [isDragging, handleSliderPosition]);

    const handleMouseUp = React.useCallback((): void => {
        setIsDragging(false);
    }, []);

    // Processing rotation change during drag
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

    const handleRotateClockwise = (): void => {
        const newRotation = (props.currentRotation + 15) % 360;
        props.onRotationChange(newRotation);
    };

    const handleRotateCounterClockwise = (): void => {
        const newRotation = (props.currentRotation - 15 + 360) % 360;
        props.onRotationChange(newRotation);
    };

    return (
        <div className={'absolute -right-24 top-1/2 transform -translate-y-1/2 flex flex-col items-center ml-4 h-full justify-center'}>
            <button
                onClick={handleRotateClockwise}
                className={'w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition-colors cursor-pointer mb-3'}
                title={'Rotate Clockwise'}
            >
                <RotateCw size={16} />
            </button>

            <div
                className={'h-44 w-2 bg-black/10 rounded-full relative cursor-grab active:cursor-grabbing'}
                ref={sliderRef}
                onMouseDown={handleMouseDown}
            >
                <div className={'absolute h-full w-0.5 left-1/2 transform -translate-x-1/2 bg-black/5'}></div>

                <div className={'absolute w-1.5 h-0.5 bg-white/50 left-1/2 transform -translate-x-1/2'} style={{ top: '0%' }}></div>
                <div className={'absolute w-1.5 h-0.5 bg-white/50 left-1/2 transform -translate-x-1/2'} style={{ top: '25%' }}></div>
                <div className={'absolute w-1.5 h-0.5 bg-white/50 left-1/2 transform -translate-x-1/2'} style={{ top: '50%' }}></div>
                <div className={'absolute w-1.5 h-0.5 bg-white/50 left-1/2 transform -translate-x-1/2'} style={{ top: '75%' }}></div>
                <div className={'absolute w-1.5 h-0.5 bg-white/50 left-1/2 transform -translate-x-1/2'} style={{ top: '100%' }}></div>

                <div className={'absolute h-full w-full rounded-full overflow-hidden'}>
                    <div
                        className={'absolute bottom-0 left-0 right-0 bg-black/40'}
                        style={{ height: `${getSliderPosition()}%` }}
                    />
                </div>

                <div
                    className={'absolute h-4 w-4 -left-1 transform -translate-x-0 -translate-y-1/2 z-10'}
                    style={{ top: `${getSliderPosition()}%` }}
                >
                    <div className={'h-full w-full bg-white rounded-full shadow-md'}></div>
                </div>

                <div className={'absolute -right-12 top-1/2 transform -translate-y-1/2 text-xs text-white/60 font-medium'}>
                    {Math.round(props.currentRotation)}°
                </div>
            </div>

            <button
                onClick={handleRotateCounterClockwise}
                className={'w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition-colors cursor-pointer mt-3'}
                title={'Rotate Counter-Clockwise'}
            >
                <RotateCcw size={16} />
            </button>
        </div>
    );
};
