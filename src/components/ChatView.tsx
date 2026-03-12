import React, { memo, useState, useEffect, useRef } from 'react';
import { Send, UserCircle, MessageSquare } from 'lucide-react';
import { Message, User } from '../types';
import { dbService } from '../services/dbService';

interface ChatViewProps {
  projectId: string;
  profile: User | null;
}

const ChatView = memo(({ projectId, profile }: ChatViewProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const data = await dbService.getMessages(projectId);
      setMessages(data);
    } catch (err) {
      console.error('Messages fetch error:', err);
    }
  };

  useEffect(() => {
    fetchMessages();
    
    const subscription = dbService.subscribeToMessages(projectId, (msg) => {
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [projectId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !profile) return;

    try {
      await dbService.sendMessage({
        projectId: projectId,
        userId: profile.id,
        text: newMessage.trim()
      });
      setNewMessage('');
    } catch (err) {
      console.error('Send message error:', err);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden h-full flex flex-col">
      <div className="p-8 border-b border-gray-50 flex items-center gap-4">
        <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white">
          <MessageSquare size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold tracking-tight">Loyiha Chat</h3>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">Jamoa bilan muloqot</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex gap-4 ${msg.userId === profile?.id ? 'flex-row-reverse' : ''}`}
          >
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex-shrink-0 flex items-center justify-center text-gray-400">
              <UserCircle size={20} />
            </div>
            <div className={`max-w-[70%] ${msg.userId === profile?.id ? 'items-end' : ''} flex flex-col`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold">{msg.profiles?.name || 'Foydalanuvchi'}</span>
                <span className="text-[10px] text-gray-400 font-medium">
                  {new Date(msg.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className={`p-4 rounded-2xl text-sm font-medium ${
                msg.userId === profile?.id 
                  ? 'bg-black text-white rounded-tr-none' 
                  : 'bg-gray-100 text-gray-800 rounded-tl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 font-bold">Xabarlar hali yo'q. Birinchi bo'lib yozing!</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-8 border-t border-gray-50">
        <div className="relative">
          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Xabaringizni yozing..."
            className="w-full pl-6 pr-16 py-4 bg-gray-100 border-2 border-transparent focus:border-black focus:bg-white rounded-2xl transition-all outline-none font-medium"
          />
          <button 
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-black/10"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
});

ChatView.displayName = 'ChatView';

export default ChatView;
