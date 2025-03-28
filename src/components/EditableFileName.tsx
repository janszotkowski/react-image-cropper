import * as React from 'react';

type EditableFileNameProps = {
    fileName: string;
    onChange: (fileName: string) => void;
} & Partial<{
    className: string;
}>;

export const EditableFileName: React.FC<EditableFileNameProps> = ({ fileName, onChange, className = '' }) => {
    const [isEditing, setIsEditing] = React.useState(false);
    const [editValue, setEditValue] = React.useState(fileName);
    const wrapperRef = React.useRef<HTMLDivElement>(null);

    // Update local state when prop changes
    React.useEffect(() => {
        setEditValue(fileName);
    }, [fileName]);

    const handleEditStart = (): void => {
        setIsEditing(true);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setEditValue(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === 'Escape') {
            // Cancel and revert to original
            setEditValue(fileName);
            setIsEditing(false);
        } else if (e.key === 'Enter') {
            // Apply changes
            onChange(editValue);
            setIsEditing(false);
        }
    };

    const handleBlur = React.useCallback((): void => {
        onChange(editValue);
        setIsEditing(false);
    }, [onChange, editValue]);

    // Handle clicks outside to exit edit mode
    React.useEffect(() => {
        if (!isEditing) return;

        const handleClickOutside = (e: MouseEvent): void => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                handleBlur();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return (): void => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isEditing, handleBlur]);

    return (
        <div
            ref={wrapperRef}
            className={`${className} h-8 flex items-center`}
        >
            {isEditing ? (
                <input
                    value={editValue}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onBlur={handleBlur}
                    className={'bg-transparent border-b border-white/30 focus:border-white outline-none text-sm text-left px-2 py-1 w-full max-w-[400px]'}
                    autoFocus
                />
            ) : (
                <div
                    onClick={handleEditStart}
                    className={'border-b border-transparent hover:border-white/30 text-sm text-center px-2 py-1 cursor-text transition-colors max-w-[400px]'}
                >
                    {fileName}
                </div>
            )}
        </div>
    );
};
