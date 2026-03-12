import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'info';
}

export const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Tasdiqlash',
    cancelText = 'Bekor qilish',
    type = 'info'
}: ConfirmModalProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100"
                    >
                        <div className="p-8 sm:p-10">
                            <div className="flex items-center justify-between mb-8">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${type === 'danger' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'
                                    }`}>
                                    <AlertTriangle size={28} />
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 text-gray-300 hover:text-black hover:bg-gray-50 rounded-xl transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-3 mb-10">
                                <h3 className="text-2xl font-black tracking-tight">{title}</h3>
                                <p className="text-gray-500 font-medium leading-relaxed">{message}</p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-4 bg-gray-50 text-gray-900 rounded-2xl font-bold text-sm hover:bg-gray-100 transition-all border border-transparent"
                                >
                                    {cancelText}
                                </button>
                                <button
                                    onClick={() => {
                                        onConfirm();
                                        onClose();
                                    }}
                                    className={`flex-1 py-4 text-white rounded-2xl font-bold text-sm transition-all shadow-lg ${type === 'danger'
                                            ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
                                            : 'bg-black hover:bg-gray-800 shadow-black/20'
                                        }`}
                                >
                                    {confirmText}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
