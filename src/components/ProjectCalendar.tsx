import React, { memo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { Task, Priority } from '../types';

export const ProjectCalendar = memo(({ tasks }: { tasks: Task[] }) => {
  const days = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sha', 'Yak'];
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Simple calendar logic for current month
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  const calendarDays = [];
  for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.HIGH: return 'bg-red-500';
      case Priority.MEDIUM: return 'bg-yellow-500';
      case Priority.LOW: return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white">
            <CalendarIcon size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight">Taqvim</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">Mart 2026</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400">
            <ChevronLeft size={20} />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-7 gap-4 mb-4">
          {days.map(day => (
            <div key={day} className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-4">
          {calendarDays.map((day, i) => (
            <div 
              key={i} 
              className={`min-h-[120px] rounded-2xl p-3 border border-gray-50 transition-all ${
                day ? 'bg-white hover:border-gray-200 hover:shadow-md' : 'bg-gray-50/50'
              } ${day === today.getDate() ? 'ring-2 ring-black' : ''}`}
            >
              {day && (
                <>
                  <span className={`text-sm font-bold ${day === today.getDate() ? 'text-black' : 'text-gray-400'}`}>
                    {day}
                  </span>
                  <div className="mt-2 space-y-1">
                    {tasks.filter(t => {
                      const d = t.dueDate ? new Date(t.dueDate) : new Date();
                      return d.getDate() === day && d.getMonth() === currentMonth;
                    }).map(task => (
                      <div key={task.id} className="flex items-center gap-1.5 p-1.5 bg-gray-50 rounded-lg group cursor-pointer hover:bg-gray-100 transition-colors">
                        <div className={`w-1 h-3 rounded-full ${getPriorityColor(task.priority)}`} />
                        <span className="text-[9px] font-bold truncate">{task.title}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

ProjectCalendar.displayName = 'ProjectCalendar';
