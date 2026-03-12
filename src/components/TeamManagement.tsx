import React, { memo, useState } from 'react';
import { UserPlus, UserCircle, ShieldCheck, Mail, MoreVertical } from 'lucide-react';
import { Project, UserRole } from '../types';
import { dbService } from '../services/dbService';
import { useToast } from '../hooks/useToast';
import { MemberModal } from './ui/MemberModal';

export const TeamManagement = memo(({ project, onRefresh }: { project: Project, onRefresh: () => void }) => {
  const { success, error } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddMember = async (username: string) => {
    try {
      setIsAdding(true);
      await dbService.addProjectMember(project.id, username);
      success('A\'zo muvaffaqiyatli qo\'shildi');
      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      error(err.message || 'Xatolik yuz berdi');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white">
            <UserPlus size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight">Jamoa</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">A'zolarni boshqarish</p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all shadow-lg shadow-black/10 flex items-center gap-2"
        >
          <UserPlus size={18} />
          <span>A'zo qo'shish</span>
        </button>
      </div>

      <MemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddMember}
        isLoading={isAdding}
      />

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {project.team?.map((member) => (
            <div key={member.id} className="p-6 bg-gray-50 rounded-[2rem] border border-transparent hover:border-gray-200 transition-all group">
              <div className="flex items-start justify-between mb-6">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-gray-300 shadow-sm group-hover:bg-black group-hover:text-white transition-all duration-500">
                  <UserCircle size={32} />
                </div>
                <button className="p-2 text-gray-300 hover:text-black transition-colors">
                  <MoreVertical size={20} />
                </button>
              </div>

              <div className="mb-6">
                <h4 className="font-bold text-lg mb-1">{member.name}</h4>
                <p className="text-sm text-gray-400 font-medium">@{member.username}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <ShieldCheck size={14} className="text-blue-500" />
                  <span>{member.role}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <Mail size={14} className="text-gray-400" />
                  <span className="lowercase">{member.email}</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200/50 flex gap-2">
                <button className="flex-1 py-2 bg-white border border-gray-200 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white hover:border-black transition-all">
                  Profil
                </button>
                <button className="flex-1 py-2 bg-white border border-gray-200 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all">
                  O'chirish
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

TeamManagement.displayName = 'TeamManagement';
