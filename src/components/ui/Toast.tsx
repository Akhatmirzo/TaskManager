import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    id: string;
    message: string;
    type: ToastType;
    onClose: (id: string) => void;
}

export const Toast = ({ id, message, type, onClose }: ToastProps) => {
    const icons = {
        success: <CheckCircle2 className="text-green-500" size={20} />,
        error: <AlertCircle className="text-red-500" size={20} />,
        info: <Info className="text-blue-500" size={20} />,
    };

    const bgColors = {
        success: 'bg-green-50 border-green-100',
        error: 'bg-red-50 border-red-100',
        info: 'bg-blue-50 border-blue-100',
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            className={cn(
                "flex items-center gap-3 p-4 pr-12 rounded-2xl border shadow-lg relative min-w-[300px] max-w-md",
                bgColors[type]
            )}
        >
            <div className="flex-shrink-0">
                {icons[type]}
            </div>
            <p className="text-sm font-bold text-gray-800 leading-tight">
                {message}
            </p>
            <button
                onClick={() => onClose(id)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-black/5 rounded-lg transition-colors text-gray-400"
            >
                <X size={16} />
            </button>
            <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 4, ease: 'linear' }}
                onAnimationComplete={() => onClose(id)}
                className={cn(
                    "absolute bottom-0 left-0 h-1 rounded-full opacity-30",
                    type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                )}
            />
        </motion.div>
    );
};

export const ToastContainer = ({ toasts, removeToast }: { toasts: any[], removeToast: (id: string) => void }) => {
    return (
        <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-3">
            <AnimatePresence mode="popLayout">
                {toasts.map(toast => (
                    <Toast
                        key={toast.id}
                        {...toast}
                        onClose={removeToast}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};
