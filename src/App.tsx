import { EditableFileName, ImageUploader, Socials } from '@/components';
import * as React from 'react';
import useImageStore from './store/imageStore';
import { Download, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';

const App = (): React.ReactElement => {
    const { selectedFile, customFileName, setCustomFileName, downloadImage, reset } = useImageStore();

    return (
        <main className={'w-full h-screen flex flex-col items-center justify-center text-white'}>
            <Socials />
            <motion.div
                className={'w-[70%] h-full flex flex-col items-center justify-center'}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 0.3 }}
            >
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
                        </div>
                    ) : (
                        <h1 className={'text-2xl mb-6 text-center h-[48px]'}>Image Editor</h1>
                    )
                }
                <ImageUploader />
                {
                    selectedFile ?
                        <div className={'mt-3 flex gap-2'}>
                            <button
                                onClick={downloadImage}
                                className={'flex items-center gap-2 text-sm bg-white/10 hover:bg-white/20 px-3 py-1 rounded-md transition-colors cursor-pointer'}
                            >
                                <Download size={16} />
                                Download
                            </button>
                            <button
                                onClick={reset}
                                className={'flex items-center gap-2 text-sm bg-red-500/10 hover:bg-red-500/20 px-3 py-1 rounded-md transition-colors cursor-pointer text-red-300'}
                            >
                                <Trash2 size={16} />
                                Delete
                            </button>
                        </div>
                        :
                        <div className={'h-[28px] mt-3'} />
                }
            </motion.div>
        </main>
    );
};

export default App;
