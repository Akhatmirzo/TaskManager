import React from 'react';
import { motion } from 'motion/react';
import { Circle, Clock, Activity, CheckCircle2, ChevronRight, AlertCircle, MessageSquare, UserCircle } from 'lucide-react';
import { Task, TaskStatus, Priority } from '../types';

interface KanbanBoardProps {
  tasks: Task[];
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onSelectTask: (id: string) => void;
}

export function KanbanBoard({ tasks, onUpdateTask, onSelectTask }: KanbanBoardProps) {
  const columns = [
    { id: TaskStatus.TODO, title: 'Rejada', icon: Circle, color: 'text-gray-400' },
    { id: TaskStatus.IN_PROGRESS, title: 'Jarayonda', icon: Clock, color: 'text-blue-500' },
    { id: TaskStatus.REVIEW, title: 'Tekshiruvda', icon: Activity, color: 'text-yellow-500' },
    { id: TaskStatus.DONE, title: 'Bajarildi', icon: CheckCircle2, color: 'text-green-500' },
  ];

  const moveTask = (taskId: string, newStatus: TaskStatus) => {
    onUpdateTask(taskId, { status: newStatus });
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.HIGH: return 'bg-red-100 text-red-600';
      case Priority.MEDIUM: return 'bg-yellow-100 text-yellow-600';
      case Priority.LOW: return 'bg-green-100 text-green-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="flex gap-6 overflow-x-auto pb-6 min-h-[calc(100vh-250px)]">
      {columns.map(column => (
        <div key={column.id} className="flex-shrink-0 w-80">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <column.icon className={column.color} size={18} />
              <h3 className="font-bold text-sm uppercase tracking-wider">{column.title}</h3>
              <span className="bg-gray-200 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {tasks.filter(t => t.status === column.id).length}
              </span>
            </div>
          </div>

          <div
            className="bg-gray-100/50 rounded-2xl p-3 min-h-[500px] border-2 border-dashed border-transparent hover:border-gray-200 transition-colors"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const draggedId = e.dataTransfer.getData('taskId');
              if (draggedId) moveTask(draggedId, column.id);
            }}
          >
            <div className="space-y-3">
              {tasks.filter(t => t.status === column.id).map(task => (
                <motion.div
                  key={task.id}
                  layoutId={task.id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('taskId', task.id)}
                  onDrop={(e) => {
                    e.stopPropagation();
                    const draggedId = e.dataTransfer.getData('taskId');
                    if (draggedId) moveTask(draggedId, column.id);
                  }}
                  onClick={() => onSelectTask(task.id)}
                  className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <button className="text-gray-300 hover:text-black opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                  <h4 className="font-bold text-sm mb-3 line-clamp-2">{task.title}</h4>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-3">
                      {task.comments.length > 0 && (
                        <div className="flex items-center gap-1 text-gray-400">
                          <MessageSquare size={12} />
                          <span className="text-[10px] font-bold">{task.comments.length}</span>
                        </div>
                      )}
                      {task.dueDate && (
                        <div className="flex items-center gap-1 text-gray-400">
                          <AlertCircle size={12} />
                          <span className="text-[10px] font-bold">
                            {new Date(task.dueDate).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                      <UserCircle size={14} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
