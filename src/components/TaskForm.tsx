import React, { useState, memo } from 'react';
import { Save, X, List, Calendar, AlertCircle, Clock } from 'lucide-react';
import { Project, Task, TaskStatus, Priority, User } from '../types';

interface TaskFormProps {
    projectId: string;
    team: User[];
    initialData?: Task;
    onSubmit: (task: Omit<Task, 'id' | 'createdAt'>) => void;
    onCancel: () => void;
}

export const TaskForm = memo(({ projectId, team, initialData, onSubmit, onCancel }: TaskFormProps) => {
    const [title, setTitle] = useState(initialData?.title || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [status, setStatus] = useState<TaskStatus>(initialData?.status || TaskStatus.TODO);
    const [priority, setPriority] = useState<Priority>(initialData?.priority || Priority.MEDIUM);
    const [assignedTo, setAssignedTo] = useState(initialData?.assignedTo || '');
    const [daysToDeadline, setDaysToDeadline] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        let dueDate = initialData?.dueDate;
        if (daysToDeadline) {
            const date = new Date();
            date.setDate(date.getDate() + parseInt(daysToDeadline));
            dueDate = date.toISOString();
        }

        onSubmit({
            projectId,
            title,
            description,
            status,
            priority,
            dueDate,
            assignedTo: assignedTo || null,
            comments: initialData?.comments || []
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden">
                <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white">
                            <List size={20} />
                        </div>
                        <h2 className="text-xl font-bold tracking-tight">
                            {initialData ? 'Vazifani Tahrirlash' : 'Yangi Vazifa'}
                        </h2>
                    </div>
                    <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Vazifa Nomi</label>
                        <input
                            required
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white rounded-xl transition-all outline-none font-medium text-sm"
                            placeholder="Masalan: UI dizaynini yakunlash"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Tavsif</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white rounded-xl transition-all outline-none font-medium h-24 resize-none text-sm"
                            placeholder="Vazifa haqida batafsil..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Status</label>
                            <select
                                value={status}
                                onChange={e => setStatus(e.target.value as TaskStatus)}
                                className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white rounded-xl transition-all outline-none font-bold text-xs cursor-pointer"
                            >
                                {Object.values(TaskStatus).map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Prioritet</label>
                            <select
                                value={priority}
                                onChange={e => setPriority(e.target.value as Priority)}
                                className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white rounded-xl transition-all outline-none font-bold text-xs cursor-pointer"
                            >
                                {Object.values(Priority).map(p => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Ijrochi</label>
                        <select
                            value={assignedTo}
                            onChange={e => setAssignedTo(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white rounded-xl transition-all outline-none font-bold text-xs cursor-pointer"
                        >
                            <option value="">Biriktirilmagan</option>
                            {team.map(member => (
                                <option key={member.id} value={member.id}>{member.name || member.username}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Muddat (necha kunda?)</label>
                        <div className="relative">
                            <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="number"
                                min="0"
                                value={daysToDeadline}
                                onChange={e => setDaysToDeadline(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white rounded-xl transition-all outline-none font-medium text-sm"
                                placeholder="Masalan: 3"
                            />
                        </div>
                        <p className="text-[10px] text-gray-400 italic ml-1">* Bo'sh qoldirilsa muddat belgilanmaydi</p>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all"
                        >
                            Bekor qilish
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-2"
                        >
                            <Save size={18} />
                            <span>Saqlash</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
});

TaskForm.displayName = 'TaskForm';
