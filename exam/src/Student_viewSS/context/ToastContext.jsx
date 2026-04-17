import { useToast as useMainToast } from '../../Library/context/ToastContext';

export const useToast = useMainToast;

export const ToastProvider = ({ children }) => {
    return <>{children}</>;
};

export const ToastContext = {
    Provider: ToastProvider
};
