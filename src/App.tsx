import { EditableFileName, ImageUploader, Socials } from '@/components';
import * as React from 'react';
import useImageStore from './store/imageStore';
import { Download } from 'lucide-react';

const App = (): React.ReactElement => {
    const { selectedFile, customFileName, setCustomFileName, downloadImage } = useImageStore();

    return (
        <main className={'w-full h-screen flex flex-col items-center justify-center text-white'}>
            <Socials />
            <div className={'w-[70%] h-full flex flex-col items-center justify-center'}>
                {
                    selectedFile ? (
                        <div className={'mb-4 flex flex-col items-center'}>
                            <EditableFileName
                                fileName={customFileName || selectedFile.name}
                                onChange={setCustomFileName}
                                className={'mb-1'}
                            />
                            <p className={'text-gray-400 text-xs text-center mt-1'}>
                                {`${(selectedFile.size / 1024).toFixed(1)} KB · ${selectedFile.type}`}
                            </p>
                            <button
                                onClick={downloadImage}
                                className={'mt-3 flex items-center gap-2 text-sm bg-white/10 hover:bg-white/20 px-3 py-1 rounded-md transition-colors cursor-pointer'}
                            >
                                <Download size={16} />
                                Download
                            </button>
                        </div>
                    ) : (
                        <h1 className={'text-2xl mb-6 text-center'}>Image Editor</h1>
                    )
                }
                <ImageUploader />
            </div>
        </main>
    );
};

export default App;
