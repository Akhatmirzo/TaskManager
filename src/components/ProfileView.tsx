import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Camera, Save, UserCircle, Mail, Shield, Send } from 'lucide-react';
import { User as UserType } from '../types';

interface ProfileViewProps {
    user: UserType;
    onUpdate: (updates: Partial<UserType>) => Promise<void>;
}

export const ProfileView = ({ user, onUpdate }: ProfileViewProps) => {
    const [name, setName] = useState(user.name);
    const [username, setUsername] = useState(user.username);
    const [avatar, setAvatar] = useState(user.avatar || '');
    const [telegramUsername, setTelegramUsername] = useState(user.telegramUsername || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await onUpdate({
                name,
                username,
                avatar: avatar || null,
                telegramUsername: telegramUsername || null
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-6">
            <div className="mb-12">
                <h2 className="text-4xl font-black mb-2">Profil Sozlamalari</h2>
                <p className="text-gray-500 font-medium">Shaxsiy ma'lumotlaringizni boshqaring</p>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {/* Left Column: Avatar */}
                <div className="space-y-6 flex flex-col items-center">
                    <div className="relative group">
                        <div className="w-48 h-48 rounded-[3rem] overflow-hidden bg-gray-100 border-4 border-white shadow-2xl relative">
                            {avatar ? (
                                <img src={avatar} alt={name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-black text-white">
                                    <User size={64} />
                                </div>
                            )}
                        </div>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-[3rem] flex items-center justify-center cursor-pointer">
                            <Camera className="text-white" size={32} />
                        </div>
                    </div>
                    <div className="w-full space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Avatar URL</label>
                        <input
                            type="text"
                            value={avatar}
                            onChange={e => setAvatar(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:border-black outline-none transition-all text-xs font-medium"
                            placeholder="https://..."
                        />
                    </div>
                </div>

                {/* Right Column: Fields */}
                <div className="md:col-span-2 space-y-8 bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <UserCircle size={12} /> To'liq ism
                            </label>
                            <input
                                required
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full px-5 py-4 bg-gray-50 border-transparent border-2 focus:border-black focus:bg-white rounded-2xl outline-none transition-all font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                @ Username
                            </label>
                            <input
                                required
                                type="text"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                className="w-full px-5 py-4 bg-gray-50 border-transparent border-2 focus:border-black focus:bg-white rounded-2xl outline-none transition-all font-bold"
                            />
                        </div>
                    </div>

                    <div className="space-y-6 pt-6 border-t border-gray-50">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-blue-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Send size={12} /> Telegram Username
                            </label>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-lg">@</span>
                                <input
                                    type="text"
                                    value={telegramUsername.replace(/^@/, '')}
                                    onChange={e => setTelegramUsername(e.target.value)}
                                    className="w-full pl-12 pr-5 py-4 bg-blue-50/30 border-blue-100 border-2 focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-blue-600 placeholder:text-blue-200"
                                    placeholder="username"
                                />
                            </div>
                            <p className="text-[10px] text-gray-400 font-medium italic ml-1">
                                * Bu orqali vazifalar sizga biriktirilganda Telegramga mention keladi
                            </p>
                        </div>

                        <div className="space-y-2 opacity-60 grayscale pointer-events-none">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Mail size={12} /> Email Manzili
                            </label>
                            <input
                                disabled
                                type="email"
                                value={user.email}
                                className="w-full px-5 py-4 bg-gray-100 border-transparent border-2 rounded-2xl font-bold"
                            />
                        </div>
                    </div>

                    <div className="pt-6 flex justify-end">
                        <button
                            disabled={isSaving}
                            type="submit"
                            className="px-10 py-4 bg-black text-white rounded-2xl font-black hover:bg-gray-800 transition-all shadow-2xl shadow-black/20 flex items-center gap-3 disabled:opacity-50"
                        >
                            {isSaving ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Save size={20} />
                            )}
                            <span>O'zgarishlarni Saqlash</span>
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};
