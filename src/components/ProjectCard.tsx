import React, { memo } from 'react';
import { Star, ChevronRight, LayoutGrid, Calendar, Users } from 'lucide-react';
import { Project } from '../types';
import { Badge } from './ui/Badge';

interface ProjectCardProps {
  project: Project;
  viewMode: 'grid' | 'list' | 'kanban';
  onClick: () => void;
  statusColor: string;
  onToggleMain: (e: React.MouseEvent) => void;
  taskCount?: number;
  completedCount?: number;
}

export const ProjectCard = memo(({ project, viewMode, onClick, statusColor, onToggleMain, taskCount = 0, completedCount = 0 }: ProjectCardProps) => {
  const progress = taskCount > 0
    ? Math.round((completedCount / taskCount) * 100)
    : 0;

  const statusColors: Record<string, string> = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    gray: 'bg-gray-500',
  };

  const statusBgColors: Record<string, string> = {
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    yellow: 'bg-yellow-50',
    red: 'bg-red-50',
    gray: 'bg-gray-50',
  };

  const statusTextColors: Record<string, string> = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    yellow: 'text-yellow-500',
    red: 'text-red-500',
    gray: 'text-gray-500',
  };

  if (viewMode === 'list') {
    return (
      <div
        onClick={onClick}
        className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between hover:shadow-md transition-all cursor-pointer group"
      >
        <div className="flex items-center gap-4 flex-1">
          <div className={cn("w-2 h-10 rounded-full", statusColors[statusColor] || 'bg-gray-500')} />
          <button
            onClick={onToggleMain}
            className={cn("p-1 rounded-md transition-colors", project.isMain ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-500')}
          >
            {project.isMain ? <Star size={16} fill="currentColor" /> : <Star size={16} />}
          </button>
          <div>
            <h3 className="font-bold text-lg leading-tight">{project.name}</h3>
            <p className="text-sm text-gray-500 line-clamp-1">{project.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-8 px-6">
          <div className="hidden md:block">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Status</p>
            <Badge color={statusColor}>{project.status}</Badge>
          </div>
          <div className="w-32 hidden sm:block">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Progress</p>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-black transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
        <ChevronRight className="text-gray-300 group-hover:text-black transition-colors" />
      </div>
    );
  }

  const team = project.team || [];
  const displayTeam = team.slice(0, 3);
  const remainingTeam = team.length > 3 ? team.length - 3 : 0;

  return (
    <div
      onClick={onClick}
      className="bg-white p-6 rounded-[2rem] border border-gray-100 hover:shadow-xl hover:shadow-black/5 hover:border-gray-300 transition-all cursor-pointer group relative overflow-hidden"
    >
      <div className={cn("absolute top-0 left-0 w-full h-1", statusColors[statusColor] || 'bg-gray-500')} />

      <div className="flex justify-between items-start mb-6">
        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white transition-all duration-500">
          <LayoutGrid size={24} />
        </div>
        <button
          onClick={onToggleMain}
          className={cn(
            "p-2 rounded-xl transition-all",
            project.isMain ? 'bg-yellow-50 text-yellow-500' : 'text-gray-300 hover:bg-gray-50 hover:text-yellow-500'
          )}
        >
          {project.isMain ? <Star size={20} fill="currentColor" /> : <Star size={20} />}
        </button>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2 group-hover:text-black transition-colors">{project.name}</h3>
        <p className="text-gray-400 text-sm line-clamp-2 font-medium leading-relaxed">{project.description}</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
          <span className="text-gray-400">Progress</span>
          <span className="text-black">{progress}%</span>
        </div>
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-black transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
        <div className="flex -space-x-2">
          {displayTeam.map((member, i) => (
            <div
              key={member.id}
              title={member.name}
              className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400 overflow-hidden"
            >
              {member.avatar ? (
                <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
              ) : (
                <span>{member.name.charAt(0)}</span>
              )}
            </div>
          ))}
          {(remainingTeam > 0 || team.length === 0) && (
            <div className="w-8 h-8 rounded-full border-2 border-white bg-black flex items-center justify-center text-[10px] font-bold text-white">
              {team.length === 0 ? <Users size={12} /> : `+${remainingTeam}`}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <Calendar size={14} />
          <span className="text-[10px] font-bold uppercase tracking-wider">
            {new Date(project.updatedAt).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' })}
          </span>
        </div>
      </div>
    </div>
  );
});

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export default ProjectCard;
