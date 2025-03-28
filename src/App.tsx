import * as React from 'react';
import { Socials } from '@/components';

const App = (): React.ReactElement => {
    return (
        <main className={'w-full h-screen flex flex-col items-center justify-center text-white'}>
            <h1 className={'text-2xl mb-8'}>Image Editor</h1>
            <Socials />
        </main>
    );
};

export default App;
