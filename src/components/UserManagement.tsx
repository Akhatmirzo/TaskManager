import React, { memo, useEffect, useState } from 'react';
import { Users, UserCircle, ShieldCheck, Mail, Search, MoreVertical, Trash2, Shield } from 'lucide-react';
import { User, UserRole } from '../types';
import { dbService } from '../services/dbService';
import { useToast } from '../hooks/useToast';
import { ConfirmModal } from './ui/ConfirmModal';

export const UserManagement = memo(() => {
  const { success, error } = useToast();
  const [profiles, setProfiles] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
  });

  const fetchProfiles = async () => {
    try {
      const data = await dbService.getAllProfiles();
      setProfiles(data);
    } catch (err) {
      console.error('Profiles fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const filteredProfiles = profiles.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteUser = (userId: string, name: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Foydalanuvchini o\'chirish',
      message: `Haqiqatan ham "${name}" foydalanuvchisini o'chirmoqchimisiz?`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await dbService.deleteProfile(userId);
          setProfiles(prev => prev.filter(p => p.id !== userId));
          success('Foydalanuvchi muvaffaqiyatli o\'chirildi');
        } catch (err) {
          error('O\'chirishda xatolik yuz berdi');
        }
      }
    });
  };

  const handleToggleRole = (user: User) => {
    const newRole = user.role === UserRole.ADMIN ? UserRole.MEMBER : UserRole.ADMIN;
    setConfirmConfig({
      isOpen: true,
      title: 'Huquqni o\'zgartirish',
      message: `Foydalanuvchi huquqini "${newRole}" ga o'zgartirmoqchimisiz?`,
      onConfirm: async () => {
        try {
          const updated = await dbService.updateProfileRole(user.id, newRole);
          setProfiles(prev => prev.map(p => p.id === user.id ? updated : p));
          success('Huquq muvaffaqiyatli o\'zgartirildi');
        } catch (err) {
          error('Huquqni o\'zgartirishda xatolik yuz berdi');
        }
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Foydalanuvchilar yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black tracking-tight mb-2">Foydalanuvchilar</h2>
          <p className="text-gray-400 font-medium">Tizimdagi barcha foydalanuvchilarni boshqarish</p>
        </div>
        <div className="relative max-w-md w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
          <input
            type="text"
            placeholder="Foydalanuvchilarni qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-transparent focus:border-black rounded-2xl transition-all outline-none font-medium shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProfiles.map((user) => (
          <div key={user.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-black/5 transition-all group">
            <div className="flex items-start justify-between mb-6">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 group-hover:bg-black group-hover:text-white transition-all duration-500">
                <UserCircle size={32} />
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-gray-300 hover:text-black transition-colors">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-bold text-xl">{user.name}</h4>
                {user.role === UserRole.ADMIN && (
                  <Shield size={16} className="text-yellow-500" />
                )}
              </div>
              <p className="text-sm text-gray-400 font-medium">@{user.username}</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <div className={`p-1.5 rounded-lg ${user.role === UserRole.ADMIN ? 'bg-yellow-50 text-yellow-600' : 'bg-blue-50 text-blue-600'}`}>
                  <ShieldCheck size={14} />
                </div>
                <span>{user.role}</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <div className="p-1.5 bg-gray-50 text-gray-400 rounded-lg">
                  <Mail size={14} />
                </div>
                <span className="lowercase truncate">{user.email}</span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-50 flex gap-3">
              <button
                onClick={() => handleToggleRole(user)}
                className="flex-1 py-3 bg-gray-50 text-gray-400 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all"
              >
                Huquqni o'zgartirish
              </button>
              <button
                onClick={() => handleDeleteUser(user.id, user.name)}
                className="p-3 bg-gray-50 text-gray-300 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProfiles.length === 0 && (
        <div className="text-center py-20 bg-white rounded-[2.5rem] border border-gray-100">
          <Users size={48} className="mx-auto text-gray-100 mb-4" />
          <p className="text-gray-400 font-bold">Foydalanuvchilar topilmadi</p>
        </div>
      )}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
        onConfirm={confirmConfig.onConfirm}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
});

UserManagement.displayName = 'UserManagement';
