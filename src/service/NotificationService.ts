import { toast, ToastOptions } from 'react-toastify';

class NotificationService {
    private defaultToastOptions: ToastOptions = {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
    };

    private errorToastOptions: ToastOptions = {
        ...this.defaultToastOptions,
        autoClose: false,
        closeOnClick: false,
        draggable: false,
    };

    public success(message: string, options?: ToastOptions): void {
        toast.success(message, { ...this.defaultToastOptions, ...options });
    }

    public error(message: string, options?: ToastOptions): void {
        toast.error(message, { ...this.errorToastOptions, ...options });
    }

    public info(message: string, options?: ToastOptions): void {
        toast.info(message, { ...this.defaultToastOptions, ...options });
    }

    public warning(message: string, options?: ToastOptions): void {
        toast.warning(message, { ...this.defaultToastOptions, ...options });
    }

    public dismissAll(): void {
        toast.dismiss();
    }
}

export const notificationService = new NotificationService();