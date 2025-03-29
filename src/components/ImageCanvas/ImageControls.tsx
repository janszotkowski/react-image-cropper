import * as React from 'react';
import { FlipHorizontal, RotateCcw, RotateCw, FlipVertical, Crop } from 'lucide-react';

type ImageControlsProps = {
    onFlipHorizontal: () => void;
    onFlipVertical: () => void;
    onRotateClockwise: () => void;
    onRotateCounterClockwise: () => void;
    onToggleCrop: () => void;
    isCropping: boolean;
};

export const ImageControls: React.FC<ImageControlsProps> = (props: ImageControlsProps): React.ReactElement => (
    <div className={'absolute -left-10 top-1/2 transform -translate-y-1/2 flex flex-col gap-2'}>
        <ControlButton
            onClick={props.onFlipHorizontal}
            title={'Flip Horizontally'}
            icon={<FlipHorizontal size={18} />}
        />
        <ControlButton
            onClick={props.onFlipVertical}
            title={'Flip Vertically'}
            icon={<FlipVertical size={18} />}
        />
        <ControlButton
            onClick={props.onRotateClockwise}
            title={'Rotate Clockwise'}
            icon={<RotateCw size={18} />}
        />
        <ControlButton
            onClick={props.onRotateCounterClockwise}
            title={'Rotate Counter-Clockwise'}
            icon={<RotateCcw size={18} />}
        />
        <ControlButton
            onClick={props.onToggleCrop}
            title={'Crop Image'}
            icon={<Crop size={18} />}
            active={props.isCropping}
        />
    </div>
);

type ControlButtonProps = {
    onClick: () => void;
    title: string;
    icon: React.ReactNode;
} & Partial<{
    active: boolean;
}>;

const ControlButton: React.FC<ControlButtonProps> = (props: ControlButtonProps): React.ReactElement => (
    <button
        onClick={props.onClick}
        className={`w-9 h-9 ${props.active ? 'bg-blue-500 hover:bg-blue-600' : 'bg-black/50 hover:bg-black/70'} rounded-full flex items-center justify-center text-white transition-colors cursor-pointer`}
        title={props.title}
    >
        {props.icon}
    </button>
);