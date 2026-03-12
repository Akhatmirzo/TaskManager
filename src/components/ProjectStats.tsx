import React, { memo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Task, TaskStatus, Priority } from '../types';

export const ProjectStats = memo(({ tasks }: { tasks: Task[] }) => {
  const statusData = Object.values(TaskStatus).map(status => ({
    name: status,
    count: tasks.filter(t => t.status === status).length
  }));

  const priorityData = Object.values(Priority).map(priority => ({
    name: priority,
    count: tasks.filter(t => t.priority === priority).length
  }));

  const COLORS = ['#000000', '#3b82f6', '#eab308', '#22c55e'];
  const PRIORITY_COLORS = {
    [Priority.HIGH]: '#ef4444',
    [Priority.MEDIUM]: '#f59e0b',
    [Priority.LOW]: '#10b981'
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-8">Vazifalar Holati</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }} 
              />
              <YAxis hide />
              <Tooltip 
                cursor={{ fill: '#f9fafb' }}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={40}>
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-8">Muhimlik Darajasi</h3>
        <div className="h-64 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={priorityData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="count"
              >
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.name as Priority] || '#000'} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
});

ProjectStats.displayName = 'ProjectStats';
