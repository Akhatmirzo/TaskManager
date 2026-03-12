import React, { useState, useEffect, useRef, memo } from 'react';
import { Send, UserCircle, MessageCircle, Clock } from 'lucide-react';
import { Project, User } from '../types';
import { dbService } from '../services/dbService';
import { useToast } from '../hooks/useToast';
import { useMessages } from '../hooks/useMessages';

export const ProjectChat = memo(({ project, currentUser }: { project: Project, currentUser: User }) => {
  const { error } = useToast();
  const { data: messages = [] } = useMessages(project.id);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await dbService.sendMessage({
        projectId: project.id,
        userId: currentUser.id,
        text: newMessage
      });
      setNewMessage('');
    } catch (err) {
      error('Xabar yuborishda xatolik');
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col h-[calc(100vh-250px)] overflow-hidden">
      <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white">
            <MessageCircle size={20} />
          </div>
          <div>
            <h3 className="font-bold tracking-tight">Loyiha Muhokamasi</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
              {project.team?.length || 0} ta ishtirokchi
            </p>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => {
          const isOwn = msg.userId === currentUser.id;
          return (
            <div key={msg.id} className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
              <div className="w-8 h-8 bg-gray-100 rounded-full flex-shrink-0 flex items-center justify-center text-gray-400">
                <UserCircle size={16} />
              </div>
              <div className={`max-w-[70%] space-y-1 ${isOwn ? 'items-end' : ''}`}>
                <div className={`p-4 rounded-2xl text-sm font-medium leading-relaxed ${isOwn ? 'bg-black text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'
                  }`}>
                  {msg.text}
                </div>
                <div className="flex items-center gap-2 px-1">
                  <span className="text-[10px] font-bold text-gray-400">
                    {new Date(msg.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSend} className="p-6 bg-gray-50/50 border-t border-gray-50">
        <div className="relative">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Xabar yozing..."
            className="w-full pl-6 pr-14 py-4 bg-white border-2 border-transparent focus:border-black rounded-2xl transition-all outline-none font-medium shadow-sm"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-black/10"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
});

ProjectChat.displayName = 'ProjectChat';
