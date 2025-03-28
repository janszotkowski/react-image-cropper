import { Socials } from '@/components';
import * as React from 'react';
import ImageUploader from './components/ImageUploader';
import useImageStore from './store/imageStore';

const App = (): React.ReactElement => {
    const { selectedFile } = useImageStore();

    return (
        <main className={'w-full h-screen flex flex-col items-center justify-center text-white'}>
            <Socials />
            <div className={'w-[70%] h-full flex flex-col items-center justify-center'}>
                {
                    selectedFile ? (
                        <div className={'mb-4'}>
                            <p className={'text-white text-sm mb-1'}>
                                {selectedFile.name}
                            </p>
                            <p className={'text-gray-400 text-xs text-center'}>
                                {`${(selectedFile.size / 1024).toFixed(1)} KB · ${selectedFile.type}`}
                            </p>
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
