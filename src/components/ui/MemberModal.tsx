import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserPlus, X, Search } from 'lucide-react';

interface MemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (username: string) => void;
    isLoading?: boolean;
}

export const MemberModal = ({
    isOpen,
    onClose,
    onAdd,
    isLoading = false
}: MemberModalProps) => {
    const [username, setUsername] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (username.trim()) {
            onAdd(username.trim());
            setUsername('');
        }
    };

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
                        <form onSubmit={handleSubmit} className="p-8 sm:p-10">
                            <div className="flex items-center justify-between mb-8">
                                <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center text-white shadow-xl shadow-black/20">
                                    <UserPlus size={28} />
                                </div>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="p-2 text-gray-300 hover:text-black hover:bg-gray-50 rounded-xl transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-3 mb-8">
                                <h3 className="text-2xl font-black tracking-tight">A'zo qo'shish</h3>
                                <p className="text-gray-500 font-medium leading-relaxed">
                                    Loyiha a'zolarini uning "Foydalanuvchi nomi" (username) orqali qo'shishingiz mumkin.
                                </p>
                            </div>

                            <div className="space-y-4 mb-10">
                                <div className="relative group">
                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" size={20} />
                                    <input
                                        autoFocus
                                        required
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="foydalanuvchi_nomi"
                                        className="w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white rounded-[1.5rem] transition-all outline-none font-bold text-lg"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-4 bg-gray-50 text-gray-900 rounded-2xl font-bold text-sm hover:bg-gray-100 transition-all"
                                >
                                    Bekor qilish
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading || !username.trim()}
                                    className="flex-1 py-4 bg-black text-white rounded-2xl font-bold text-sm hover:bg-gray-800 transition-all shadow-xl shadow-black/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <UserPlus size={18} />
                                            Qo'shish
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
