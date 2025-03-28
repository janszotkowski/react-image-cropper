import React from 'react';
import ReactDOM from 'react-dom/client';
import { ToastContainer } from 'react-toastify';
import App from './App.tsx';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

const rootEl = document.getElementById('root');
if (rootEl) {
    const root = ReactDOM.createRoot(rootEl);
    root.render(
        <React.StrictMode>
            <ToastContainer theme={'dark'} />
            <App />
        </React.StrictMode>,
    );
}
