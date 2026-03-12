import React, { useState, memo } from 'react';
import { motion } from 'motion/react';
import { LayoutGrid, UserCircle, Users, Key, ArrowRight } from 'lucide-react';
import { auth } from '../lib/supabase';
import { UserRole } from '../types';
import { dbService } from '../services/dbService';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from './ui/Toast';

export const AuthView = memo(() => {
  const [isLoading, setIsLoading] = useState(false);
  const { toasts, removeToast, error } = useToast();

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const { error: authError } = await auth.signInWithGoogle();
      if (authError) throw authError;
    } catch (err: any) {
      error(err.message || 'Google bilan kirishda xatolik');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-6 text-black font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl shadow-black/5 overflow-hidden border border-gray-100"
      >
        <div className="p-10">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-20 h-20 bg-black rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-black/20 mb-8 transform transition-transform hover:scale-105 active:scale-95 cursor-default">
              <LayoutGrid size={40} />
            </div>
            <h2 className="text-4xl font-black tracking-tight mb-3">ProManager</h2>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Premium boshqaruv tizimi</p>
          </div>

          <div className="space-y-6">
            <div className="text-center mb-8">
              <p className="text-gray-500 font-medium leading-relaxed">
                Loyihalaringizni tartibga solish va jamoangiz bilan hamkorlik qilish uchun Google orqali kiring
              </p>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="group w-full py-5 bg-white border-2 border-gray-100 text-black rounded-[2rem] font-black text-lg hover:border-black hover:bg-gray-50 transition-all flex items-center justify-center gap-4 disabled:opacity-50 shadow-sm relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-black/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span className="relative z-10">Google bilan davom etish</span>
            </button>

            <div className="flex items-center justify-center gap-2 pt-8">
              <Users size={16} className="text-gray-300" />
              <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">Xavfsiz ulanish</p>
            </div>
          </div>
        </div>
      </motion.div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
});

AuthView.displayName = 'AuthView';

export default AuthView;
