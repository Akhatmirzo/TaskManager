import React, { useState, useEffect, memo, useCallback } from 'react';
import { motion } from 'motion/react';
import { X, Clock, Tag, AlertCircle, MessageSquare, Send, UserCircle, Timer, Save, Trash2, Calendar } from 'lucide-react';
import { Task, TaskStatus, Priority, Comment } from '../types';
import { Badge } from './ui/Badge';

interface TaskDetailModalProps {
  task: Task;
  onClose: () => void;
  onUpdate: (updates: Partial<Task>) => void;
  onAddComment: (text: string) => void;
}

export const TaskDetailModal = memo(({ task, onClose, onUpdate, onAddComment }: TaskDetailModalProps) => {
  const [commentText, setCommentText] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(Math.round((task.actualHours || 0) * 3600));

  useEffect(() => {
    let interval: any;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => {
          const next = prev + 1;
          // Sync with DB every 30 seconds
          if (next % 30 === 0) {
            onUpdate({ actualHours: next / 3600 });
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, onUpdate]);

  const handleToggleTimer = useCallback(() => {
    if (isTimerRunning) {
      onUpdate({ actualHours: elapsedSeconds / 3600 });
    }
    setIsTimerRunning(!isTimerRunning);
  }, [isTimerRunning, elapsedSeconds, onUpdate]);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(commentText);
    setCommentText('');
  };

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
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
        className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
              <Clock size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Vazifa Tafsilotlari</h2>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">ID: {task.id.slice(0, 8)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-black"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">Sarlavha</label>
                <input
                  type="text"
                  value={task.title}
                  onChange={(e) => onUpdate({ title: e.target.value })}
                  className="text-2xl font-bold w-full bg-transparent border-none focus:ring-0 p-0 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">Tavsif</label>
                <textarea
                  value={task.description}
                  onChange={(e) => onUpdate({ description: e.target.value })}
                  placeholder="Vazifa haqida batafsil ma'lumot..."
                  className="w-full h-32 bg-gray-50 rounded-2xl p-4 text-sm font-medium border-2 border-transparent focus:border-black focus:bg-white transition-all outline-none resize-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Muhokama</label>
                  <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{task.comments.length} ta fikr</span>
                </div>

                <div className="space-y-4 mb-6">
                  {task.comments.map((comment: Comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex-shrink-0 flex items-center justify-center text-gray-400">
                        <UserCircle size={16} />
                      </div>
                      <div className="flex-1 bg-gray-50 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold">Foydalanuvchi</span>
                          <span className="text-[10px] text-gray-400 font-medium">
                            {new Date(comment.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 font-medium leading-relaxed">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddComment} className="relative">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Fikringizni yozing..."
                    className="w-full pl-4 pr-12 py-4 bg-gray-100 border-2 border-transparent focus:border-black focus:bg-white rounded-2xl transition-all outline-none font-medium text-sm"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-black/10"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-3xl p-6 space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">Status</label>
                  <select
                    value={task.status}
                    onChange={(e) => onUpdate({ status: e.target.value as TaskStatus })}
                    className="w-full bg-white border-2 border-transparent focus:border-black rounded-xl p-2 text-sm font-bold outline-none cursor-pointer"
                  >
                    {Object.values(TaskStatus).map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">Muddat (Deadline)</label>
                  <div className="relative group">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={16} />
                    <input
                      type="datetime-local"
                      value={task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : ''}
                      onChange={(e) => onUpdate({ dueDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                      className="w-full bg-white border-2 border-transparent focus:border-black rounded-xl pl-10 p-2 text-sm font-bold outline-none cursor-pointer shadow-sm transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">Muhimlik</label>
                  <div className="flex flex-wrap gap-2">
                    {Object.values(Priority).map(p => (
                      <button
                        key={p}
                        onClick={() => onUpdate({ priority: p })}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${task.priority === p
                          ? 'bg-black text-white'
                          : 'bg-white text-gray-400 hover:text-black hover:bg-gray-100'
                          }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">Vaqt Sarfi</label>
                  <div className="bg-white rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Timer className={isTimerRunning ? 'text-blue-500 animate-pulse' : 'text-gray-300'} size={20} />
                      <span className="text-lg font-mono font-bold">{formatTime(elapsedSeconds)}</span>
                    </div>
                    <button
                      onClick={handleToggleTimer}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isTimerRunning ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-blue-50 text-blue-500 hover:bg-blue-100'
                        }`}
                    >
                      {isTimerRunning ? <X size={14} /> : <Timer size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="px-2 space-y-3">
                <button
                  onClick={() => onUpdate({ actualHours: elapsedSeconds / 3600 })}
                  className="w-full flex items-center gap-3 p-3 text-gray-500 hover:text-black hover:bg-gray-50 rounded-xl transition-all text-sm font-bold"
                >
                  <Save size={18} />
                  <span>Saqlash</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all text-sm font-bold">
                  <Trash2 size={18} />
                  <span>O'chirish</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
});

export default TaskDetailModal;
