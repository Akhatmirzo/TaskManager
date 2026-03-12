import React, { memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutGrid, List, Kanban, MessageSquare, BarChart3, Calendar, Users, Bell, LogOut, Search, Plus, Star, ChevronDown, FolderPlus, X, UserCircle } from 'lucide-react';
import { User, Project, UserRole } from '../types';

interface SidebarProps {
  profile: User | null;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  onSignOut: () => void;
  projects: Project[];
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  setIsCreating: (val: boolean) => void;
  isOpen?: boolean;
  onClose?: () => void;
  onEditProject?: () => void;
}

const Sidebar = memo(({
  profile,
  activeTab,
  setActiveTab,
  onSignOut,
  projects,
  selectedProjectId,
  setSelectedProjectId,
  setIsCreating,
  isOpen,
  onClose,
  onEditProject
}: SidebarProps) => {
  const mainProjects = projects.filter(p => p.isMain);

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-100 flex flex-col h-screen transition-transform duration-300 lg:sticky lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white shadow-lg shadow-black/20">
                <LayoutGrid size={24} />
              </div>
              <h1 className="text-xl font-bold tracking-tight">ProManager</h1>
            </div>
            <button onClick={onClose} className="p-2 lg:hidden text-gray-400 hover:text-black">
              <X size={20} />
            </button>
          </div>

          <div className="mb-10 space-y-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Loyiha tanlash</p>
            <div className="relative group">
              <select
                value={selectedProjectId || ''}
                onChange={(e) => {
                  setSelectedProjectId(e.target.value || null);
                  setActiveTab('tasks');
                  if (onClose) onClose();
                }}
                className="w-full pl-4 pr-10 py-4 bg-gray-50 border-2 border-transparent focus:border-black rounded-2xl transition-all outline-none font-bold text-sm appearance-none cursor-pointer"
              >
                <option value="">Barcha loyihalar</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>

            {selectedProjectId && (
              <button
                onClick={onEditProject}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 text-gray-400 border border-gray-100 rounded-2xl font-bold text-xs hover:text-black hover:bg-white transition-all"
              >
                <Plus size={14} className="rotate-45" />
                Sozlamalar (Telegram)
              </button>
            )}

            <button
              onClick={() => {
                setIsCreating(true);
                if (onClose) onClose();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-gray-50 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl font-bold text-sm hover:border-black hover:text-black hover:bg-white transition-all group"
            >
              <FolderPlus size={18} className="group-hover:scale-110 transition-transform" />
              Yangi loyiha
            </button>
          </div>

          <nav className="space-y-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 ml-4">Navigatsiya</p>
            {[
              { id: 'tasks', icon: List, label: 'Vazifalar' },
              { id: 'kanban', icon: Kanban, label: 'Kanban' },
              { id: 'chat', icon: MessageSquare, label: 'Chat' },
              { id: 'stats', icon: BarChart3, label: 'Statistika' },
              { id: 'calendar', icon: Calendar, label: 'Kalendar' },
              { id: 'team', icon: Users, label: 'Jamoa' },
              { id: 'profile', icon: UserCircle, label: 'Profil' },
              ...(profile?.role === UserRole.ADMIN ? [{ id: 'users', icon: Users, label: 'Foydalanuvchilar' }] : []),
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (onClose) onClose();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-bold text-sm ${activeTab === item.id
                  ? 'bg-black text-white shadow-xl shadow-black/10'
                  : 'text-gray-400 hover:text-black hover:bg-gray-50'
                  }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-8 border-t border-gray-50">
          <div
            onClick={() => setActiveTab('profile')}
            className="flex items-center gap-4 p-4 bg-gray-50 rounded-[2rem] border border-gray-100 cursor-pointer hover:bg-gray-100 transition-all group"
          >
            <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center font-bold text-sm shadow-md overflow-hidden group-hover:scale-105 transition-transform">
              {profile?.avatar ? (
                <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                profile?.name.charAt(0)
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{profile?.name}</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{profile?.role}</p>
            </div>
            <button
              onClick={onSignOut}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;
