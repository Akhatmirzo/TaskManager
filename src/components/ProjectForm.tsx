import React, { useState, memo } from 'react';
import { Save, X, LayoutGrid, FileText, Tag, AlertCircle } from 'lucide-react';
import { Project, ProjectStatus } from '../types';

interface ProjectFormProps {
  initialData?: Project;
  onSubmit: (p: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'team'>) => void;
  onCancel: () => void;
}

export const ProjectForm = memo(({ initialData, onSubmit, onCancel }: ProjectFormProps) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [status, setStatus] = useState<ProjectStatus>(initialData?.status || ProjectStatus.IDEA);
  const [telegramBotToken, setTelegramBotToken] = useState(initialData?.telegramBotToken || '');
  const [telegramChatId, setTelegramChatId] = useState(initialData?.telegramChatId || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, description, status, notes: '', telegramBotToken, telegramChatId });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white">
              <LayoutGrid size={20} />
            </div>
            <h2 className="text-xl font-bold tracking-tight">Yangi Loyiha</h2>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Loyiha Nomi</label>
            <input
              required
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white rounded-2xl transition-all outline-none font-medium"
              placeholder="Masalan: Mobile App Design"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Tavsif</label>
            <textarea
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white rounded-2xl transition-all outline-none font-medium h-32 resize-none"
              placeholder="Loyiha haqida qisqacha..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as ProjectStatus)}
              className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white rounded-2xl transition-all outline-none font-bold cursor-pointer"
            >
              {Object.values(ProjectStatus).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Telegram Bildirishnomalari (Ixtiyoriy)</h3>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Bot Token</label>
              <input
                type="password"
                value={telegramBotToken}
                onChange={e => setTelegramBotToken(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white rounded-xl transition-all outline-none font-medium text-sm"
                placeholder="123456789:ABCDEF..."
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Chat ID / Group ID</label>
              <input
                type="text"
                value={telegramChatId}
                onChange={e => setTelegramChatId(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white rounded-xl transition-all outline-none font-medium text-sm"
                placeholder="-100123456789"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="flex-1 py-4 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-2"
            >
              <Save size={20} />
              <span>Saqlash</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

ProjectForm.displayName = 'ProjectForm';
