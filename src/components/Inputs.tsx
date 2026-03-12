import React, { useState } from 'react';
import { Plus, Tag, AlertCircle } from 'lucide-react';
import { Priority } from '../types';

export function TaskInput({ onAdd }: { onAdd: (title: string, priority: Priority) => void }) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title, priority);
    setTitle('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
      <div className="flex-1 w-full relative">
        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Yangi vazifa qo'shish..."
          className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white rounded-2xl transition-all outline-none font-medium"
        />
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <select 
          value={priority}
          onChange={e => setPriority(e.target.value as Priority)}
          className="flex-1 sm:w-32 px-4 py-4 bg-gray-50 border-2 border-transparent focus:border-black rounded-2xl font-bold text-xs uppercase tracking-widest outline-none cursor-pointer"
        >
          {Object.values(Priority).map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <button 
          type="submit"
          className="p-4 bg-black text-white rounded-2xl hover:bg-gray-800 transition-all shadow-lg shadow-black/10 active:scale-95"
        >
          <Plus size={24} />
        </button>
      </div>
    </form>
  );
}

export function FeatureInput({ onAdd }: { onAdd: (title: string, desc: string) => void }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title, desc);
    setTitle('');
    setDesc('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
          <Plus size={16} />
        </div>
        <h3 className="font-bold tracking-tight">Yangi Feature</h3>
      </div>
      <input 
        type="text" 
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Feature nomi..."
        className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white rounded-xl transition-all outline-none font-bold text-sm"
      />
      <textarea 
        value={desc}
        onChange={e => setDesc(e.target.value)}
        placeholder="Qisqacha tavsif..."
        className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white rounded-xl transition-all outline-none font-medium text-sm h-24 resize-none"
      />
      <button 
        type="submit"
        className="w-full py-3 bg-black text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg shadow-black/10"
      >
        Qo'shish
      </button>
    </form>
  );
}
