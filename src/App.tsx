import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  ChevronRight,
  Clock,
  CheckCircle2,
  Circle,
  MoreVertical,
  Trash2,
  Edit3,
  ArrowLeft,
  Tag,
  AlertCircle,
  PlusCircle,
  Save,
  X,
  MessageSquare,
  FileText,
  Bell,
  Star,
  Users,
  BarChart3,
  Calendar as CalendarIcon,
  Activity,
  UserPlus,
  Menu,
  FolderPlus,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Project,
  ProjectStatus,
  Priority,
  Task,
  User,
  TaskStatus,
  UserRole
} from './types';
import { auth, supabase } from './lib/supabase';
import { dbService } from './services/dbService';

// Components
import { AuthView } from './components/AuthView';
import Sidebar from './components/Sidebar';
import { ProjectCard } from './components/ProjectCard';
import { TaskDetailModal } from './components/TaskDetailModal';
import { KanbanBoard as KanbanView } from './components/KanbanBoard';
import { ProjectStats as StatsView } from './components/ProjectStats';
import { ProjectCalendar as CalendarView } from './components/ProjectCalendar';
import { TeamManagement as TeamView } from './components/TeamManagement';
import { ProjectChat as ChatView } from './components/ProjectChat';
import { ProjectForm } from './components/ProjectForm';
import { TaskForm } from './components/TaskForm';
import { UserManagement } from './components/UserManagement';
import { ProfileView } from './components/ProfileView';

// Hooks & Store
import { useStore } from './store/useStore';
import { useProjects } from './hooks/useProjects';
import { useProfile } from './hooks/useProfile';
import { useTasks } from './hooks/useTasks';
import { useNotificationsHistory } from './hooks/useNotificationsHistory';
import { useQueryClient } from '@tanstack/react-query';

import { useNotifications } from './hooks/useNotifications';
import { ToastContainer } from './components/ui/Toast';
import { useToast } from './hooks/useToast';
import { ConfirmModal } from './components/ui/ConfirmModal';

// --- Constants ---
const NOTIF_KEY = 'promanager_last_notif';

// --- UI Helpers ---
const Badge = ({ children, color = 'blue' }: { children: React.ReactNode, color?: string }) => {
  const colors: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    green: 'bg-green-100 text-green-700 border-green-200',
    yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    red: 'bg-red-100 text-red-700 border-red-200',
    gray: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${colors[color] || colors.blue}`}>
      {children}
    </span>
  );
};

export default function App() {
  const queryClient = useQueryClient();
  const {
    session, setSession,
    profile, setProfile,
    activeTab, setActiveTab,
    selectedProjectId, setSelectedProjectId,
    selectedTaskId, setSelectedTaskId,
    isSidebarOpen, setIsSidebarOpen,
    showNotifPanel, setShowNotifPanel,
    isCreatingProject, setIsCreatingProject,
    isEditingProject, setIsEditingProject,
    searchQuery, setSearchQuery,
    viewMode, setViewMode,
    confirmConfig, setConfirmConfig,
  } = useStore();

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const { toasts, removeToast, success, error, info } = useToast();

  // Queries
  const { data: projects = [], isLoading: isProjectsLoading } = useProjects();
  const { data: profileData } = useProfile(session?.user?.id);
  const { data: tasks = [] } = useTasks(selectedProjectId);
  const { data: notifications = [], refetch: refetchNotifs } = useNotificationsHistory();

  const { requestPermission } = useNotifications(notificationsEnabled, projects, error);

  const isLoading = isProjectsLoading && !session; // Simplified loading

  // Auth Listener
  useEffect(() => {
    // Initial Session check
    auth.getSession().then(({ data: { session: initialSession } }) => {
      if (initialSession) setSession(initialSession);
    });

    const { data: { subscription } } = auth.onAuthStateChange((event: any, currentSession: any) => {
      if (event === 'SIGNED_IN') {
        setSession(currentSession);
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setProfile(null);
        setSelectedProjectId(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setSession, setProfile, setSelectedProjectId]);

  // Sync profile data to store
  useEffect(() => {
    if (profileData) setProfile(profileData);
  }, [profileData, setProfile]);

  // Tab Ref for stable notification listener
  const activeTabRef = useRef(activeTab);
  useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);

  // General Notification Subscription
  useEffect(() => {
    if (session) {
      const sub = dbService.subscribeToNotifications((notif) => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        info(`${notif.title}: ${notif.message}`);
      });
      return () => { sub.unsubscribe(); };
    }
  }, [session, info, queryClient]);

  // Deadline Monitoring
  useEffect(() => {
    if (!session || tasks.length === 0) return;

    const checkDeadlines = () => {
      const now = new Date();
      tasks.forEach(task => {
        if (task.status === TaskStatus.DONE || !task.dueDate) return;

        const dueDate = new Date(task.dueDate);
        const diffMs = dueDate.getTime() - now.getTime();
        const diffHrs = diffMs / (1000 * 60 * 60);

        // Notify if < 24h and not already notified (using a simple session-based set)
        const storageKey = `notified_deadline_${task.id}`;
        const lastNotified = localStorage.getItem(storageKey);

        if (diffHrs > 0 && diffHrs <= 24 && !lastNotified) {
          info(`Muddat yaqinlashmoqda: "${task.title}" vazifasiga 24 soatdan kam vaqt qoldi.`);
          localStorage.setItem(storageKey, '24h');
        } else if (diffHrs > 0 && diffHrs <= 1 && lastNotified !== '1h') {
          error(`DIQQAT: "${task.title}" vazifasining muddati 1 soatdan keyin tugar ekan!`);
          localStorage.setItem(storageKey, '1h');
        }
      });
    };

    const interval = setInterval(checkDeadlines, 60000); // Check every minute
    checkDeadlines(); // Initial check

    return () => clearInterval(interval);
  }, [session, tasks, info, error]);

  // Real-time Data Sync (Query Invalidation Bridge)
  useEffect(() => {
    if (!session) return;

    // Listen to all projects changes
    const projectsSub = dbService.subscribeToTable('projects', () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    });

    // Listen to all tasks changes
    const tasksSub = dbService.subscribeToTable('tasks', () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    });

    // Listen to all messages changes
    const messagesSub = dbService.subscribeToTable('messages', () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    });

    return () => {
      projectsSub.unsubscribe();
      tasksSub.unsubscribe();
      messagesSub.unsubscribe();
    };
  }, [session, queryClient]);

  const requestNotificationPermission = useCallback(async () => {
    const granted = await requestPermission();
    setNotificationsEnabled(granted);
  }, [requestPermission]);

  const selectedProject = useMemo(() =>
    projects.find(p => p.id === selectedProjectId),
    [projects, selectedProjectId]
  );

  const filteredProjects: Project[] = useMemo(() => {
    return projects.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [projects, searchQuery]);


  // Actions
  const addProject = useCallback(async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'team'>) => {
    if (!profile) return;
    try {
      await dbService.createProject({
        ...projectData,
        isMain: false,
        notes: '',
        createdBy: profile.id,
      });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsCreatingProject(false);
      success('Loyiha yaratildi');
    } catch (err) {
      error('Loyiha yaratishda xatolik');
    }
  }, [profile, error, queryClient, setIsCreatingProject, success]);

  const updateProject = useCallback(async (id: string, updates: Partial<Project>) => {
    try {
      await dbService.updateProject(id, { ...updates, updatedAt: new Date().toISOString() });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    } catch (err) {
      error('Yangilashda xatolik');
    }
  }, [error, queryClient]);

  const toggleMainProject = useCallback(async (id: string) => {
    const project = projects.find(p => p.id === id);
    if (!project) return;
    try {
      const newValue = !project.isMain;
      await dbService.updateProject(id, { isMain: newValue });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    } catch (err) {
      error('Xatolik yuz berdi');
    }
  }, [projects, queryClient, error]);

  const deleteProject = useCallback(async (id: string) => {
    if (profile?.role !== UserRole.ADMIN) {
      error('Faqat Adminlar loyihani o\'chira oladi');
      return;
    }
    setConfirmConfig({
      isOpen: true,
      title: 'Loyihani o\'chirish',
      message: 'Haqiqatan ham ushbu loyihani o\'chirmoqchimisiz?',
      type: 'danger',
      onConfirm: async () => {
        try {
          await dbService.deleteProject(id);
          queryClient.invalidateQueries({ queryKey: ['projects'] });
          if (selectedProjectId === id) setSelectedProjectId(null);
          success('Loyiha o\'chirildi');
          setConfirmConfig(p => ({ ...p, isOpen: false }));
        } catch (err) {
          error('O\'chirishda xatolik');
        }
      }
    });
  }, [profile, selectedProjectId, error, success, queryClient, setSelectedProjectId, setConfirmConfig]);

  const addTask = useCallback(async (task: Omit<Task, 'id' | 'createdAt'>) => {
    try {
      const newTask = await dbService.createTask(task);
      queryClient.invalidateQueries({ queryKey: ['tasks', task.projectId] });
      setIsCreatingTask(false);

      // Manual Notifications
      if (profile) {
        // 1. Notify Assignee (if not the creator)
        if (task.assignedTo && task.assignedTo !== profile.id) {
          await dbService.createNotification({
            userId: task.assignedTo,
            projectId: task.projectId,
            type: 'task_assigned',
            title: 'Sizga vazifa biriktirildi',
            message: `"${task.title}" vazifasi sizga topshirildi.`
          });
        }

        // 2. Notify Creator (if assignee is different)
        if (task.assignedTo && task.assignedTo !== profile.id) {
          await dbService.createNotification({
            userId: profile.id,
            projectId: task.projectId,
            type: 'task_created',
            title: 'Vazifa yaratildi',
            message: `"${task.title}" vazifasi ijrochiga biriktirildi.`
          });
        }
      }

      success('Vazifa qo\'shildi');
    } catch (err) {
      error('Vazifa qo\'shishda xatolik');
    }
  }, [error, queryClient, success, profile]);

  const updateTask = useCallback(async (projectId: string, taskId: string, updates: Partial<Task>) => {
    try {
      await dbService.updateTask(taskId, updates);
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    } catch (err) {
      error('Yangilashda xatolik');
    }
  }, [error, queryClient]);

  const addComment = useCallback(async (projectId: string, taskId: string, text: string) => {
    if (!profile) return;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const newComment = { id: crypto.randomUUID(), text, createdAt: new Date().toISOString(), userId: profile.id };
    updateTask(projectId, taskId, { comments: [...task.comments, newComment] });
  }, [profile, tasks, updateTask]);

  const toggleTask = useCallback((projectId: string, taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const newStatus = task.status === TaskStatus.DONE ? TaskStatus.TODO : TaskStatus.DONE;
      updateTask(projectId, taskId, { status: newStatus });
    }
  }, [tasks, updateTask]);

  const getStatusColor = useCallback((status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.IDEA: return 'gray';
      case ProjectStatus.IN_PROGRESS: return 'blue';
      case ProjectStatus.COMPLETED: return 'green';
      case ProjectStatus.ON_HOLD: return 'yellow';
      default: return 'gray';
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (!session) return <AuthView />;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="flex min-h-screen bg-[#F5F5F5] text-gray-900 font-sans selection:bg-black selection:text-white">
      <Sidebar
        profile={profile}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSignOut={() => auth.signOut()}
        projects={projects}
        selectedProjectId={selectedProjectId}
        setSelectedProjectId={setSelectedProjectId}
        setIsCreating={() => setIsCreatingProject(true)}
        onEditProject={() => setIsEditingProject(true)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        {/* Header */}
        <header className="h-24 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-6 sm:px-10 sticky top-0 z-30">
          <div className="flex items-center gap-4 sm:gap-6 flex-1">
            <button onClick={() => setIsSidebarOpen(true)} className="p-3 hover:bg-gray-100 rounded-2xl transition-all text-gray-400 hover:text-black lg:hidden">
              <Menu size={20} />
            </button>
            {selectedProjectId && (
              <button onClick={() => setSelectedProjectId(null)} className="p-3 hover:bg-gray-100 rounded-2xl transition-all text-gray-400 hover:text-black hidden sm:flex">
                <ArrowLeft size={20} />
              </button>
            )}
            <div className="relative max-w-md w-full group hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" size={18} />
              <input
                type="text"
                placeholder="Qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white rounded-2xl transition-all outline-none font-medium text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 relative">
            <button
              onClick={() => setShowNotifPanel(!showNotifPanel)}
              className={`p-3 rounded-2xl transition-all border relative ${unreadCount > 0 ? 'bg-blue-50 border-blue-100 text-blue-500' : 'bg-gray-50 border-gray-100 text-gray-400 hover:text-black'}`}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Panel */}
            <AnimatePresence>
              {showNotifPanel && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full right-0 mt-4 w-80 bg-white rounded-[2rem] shadow-2xl border border-gray-100 z-50 overflow-hidden"
                >
                  <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                    <h3 className="font-black">Bildirishnomalar</h3>
                    <button onClick={() => setShowNotifPanel(false)} className="text-gray-400 hover:text-black transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {notifications.length === 0 ? (
                      <p className="text-center py-10 text-gray-400 font-medium text-sm">Hozircha yo'q</p>
                    ) : (
                      notifications
                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                        .map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => {
                              dbService.markNotificationAsRead(notif.id);
                              queryClient.invalidateQueries({ queryKey: ['notifications'] });
                            }}
                            className={`p-4 rounded-2xl transition-all cursor-pointer border ${notif.is_read ? 'bg-white border-gray-50 opacity-60' : 'bg-blue-50/50 border-blue-100 hover:border-blue-200'}`}
                          >
                            <h4 className="text-xs font-black uppercase tracking-widest mb-1">{notif.title}</h4>
                            <p className="text-xs text-gray-600 font-medium leading-relaxed">{notif.message}</p>
                            <span className="text-[10px] text-gray-400 font-bold block mt-2">
                              {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100 hidden sm:flex">
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white shadow-md text-black' : 'text-gray-400 hover:text-gray-600'}`}><LayoutGrid size={18} /></button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white shadow-md text-black' : 'text-gray-400 hover:text-gray-600'}`}><List size={18} /></button>
            </div>
          </div>
        </header>


        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'users' && profile?.role === UserRole.ADMIN ? (
              <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><UserManagement /></motion.div>
            ) : !selectedProjectId ? (
              <motion.div key="projects" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8" : "space-y-4"}>
                {filteredProjects.map(p => (
                  <ProjectCard
                    key={p.id}
                    project={p}
                    viewMode={viewMode}
                    onClick={() => setSelectedProjectId(p.id)}
                    onToggleMain={(e) => { e.stopPropagation(); toggleMainProject(p.id); }}
                    statusColor={getStatusColor(p.status)}
                    taskCount={(p as any).taskCount || 0}
                    completedCount={(p as any).completedCount || 0}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div key="detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8 flex flex-col h-full">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <Badge color={getStatusColor(selectedProject!.status)}>{selectedProject!.status}</Badge>
                    <h2 className="text-4xl font-black">{selectedProject!.name}</h2>
                    <p className="text-gray-500 font-medium">{selectedProject!.description}</p>
                  </div>
                </div>

                <div className="flex gap-8 border-b border-gray-100 mb-8">
                  {['tasks', 'kanban', 'chat', 'stats', 'calendar', 'team'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab as any)} className={`pb-4 text-sm font-bold relative ${activeTab === tab ? 'text-black' : 'text-gray-400'}`}>
                      {tab.toUpperCase()}
                      {activeTab === tab && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-black rounded-full" />}
                    </button>
                  ))}
                </div>

                <div className="flex-1">
                  {activeTab === 'tasks' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h3 className="text-xl font-bold">Vazifalar Ro'yxati</h3>
                          <p className="text-sm text-gray-500 font-medium">{tasks.length} ta vazifa mavjud</p>
                        </div>
                        <button
                          onClick={() => setIsCreatingTask(true)}
                          className="px-6 py-3 bg-black text-white rounded-2xl font-bold text-sm hover:bg-gray-800 transition-all shadow-xl shadow-black/10 flex items-center gap-2"
                        >
                          <Plus size={18} />
                          <span>Yangi Vazifa</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {tasks.length === 0 ? (
                          <div className="py-20 text-center bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
                            <List className="mx-auto text-gray-300 mb-4" size={48} />
                            <p className="text-gray-400 font-bold">Hozircha vazifalar yo'q</p>
                          </div>
                        ) : (
                          tasks.map(t => (
                            <div
                              key={t.id}
                              onClick={() => setSelectedTaskId(t.id)}
                              className="group p-6 bg-white border border-gray-100 rounded-[2rem] hover:shadow-2xl hover:shadow-black/5 transition-all cursor-pointer flex items-center gap-6"
                            >
                              <button
                                onClick={(e) => { e.stopPropagation(); toggleTask(selectedProject!.id, t.id); }}
                                className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${t.status === TaskStatus.DONE ? 'bg-black border-black text-white' : 'border-gray-200 text-transparent group-hover:border-black'}`}
                              >
                                <CheckCircle2 size={16} />
                              </button>

                              <div className="flex-1">
                                <h4 className={`font-bold transition-all ${t.status === TaskStatus.DONE ? 'line-through text-gray-400' : ''}`}>{t.title}</h4>
                                {t.description && (
                                  <p className="text-xs text-gray-400 font-medium truncate max-w-md mt-0.5">{t.description}</p>
                                )}
                              </div>

                              <div className="flex items-center gap-4">
                                {t.dueDate && (
                                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg text-[10px] font-bold text-gray-400">
                                    <Clock size={12} />
                                    {new Date(t.dueDate).toLocaleDateString()}
                                  </div>
                                )}
                                <Badge color={t.priority === Priority.HIGH ? 'red' : t.priority === Priority.MEDIUM ? 'yellow' : 'gray'}>
                                  {t.priority}
                                </Badge>
                                <MoreVertical size={16} className="text-gray-300" />
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                  {activeTab === 'kanban' && <KanbanView tasks={tasks} onUpdateTask={(id, updates) => updateTask(selectedProjectId!, id, updates)} onSelectTask={setSelectedTaskId} />}
                  {activeTab === 'chat' && <ChatView project={selectedProject!} currentUser={profile!} />}
                  {activeTab === 'stats' && <StatsView tasks={tasks} />}
                  {activeTab === 'calendar' && <CalendarView tasks={tasks} />}
                  {activeTab === 'team' && <TeamView project={selectedProject!} onRefresh={() => queryClient.invalidateQueries({ queryKey: ['projects'] })} />}
                  {activeTab === 'users' && <UserManagement />}
                  {activeTab === 'profile' && profile && (
                    <ProfileView
                      user={profile}
                      onUpdate={async (updates) => {
                        const updated = await dbService.updateProfile(profile.id, updates);
                        setProfile(updated);
                        queryClient.invalidateQueries({ queryKey: ['profiles'] });
                        success('Profil yangilandi');
                      }}
                    />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {isCreatingProject && (
          <ProjectForm
            onSubmit={addProject}
            onCancel={() => setIsCreatingProject(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEditingProject && selectedProject && (
          <ProjectForm
            initialData={selectedProject}
            onSubmit={(data) => {
              updateProject(selectedProject.id, data);
              setIsEditingProject(false);
            }}
            onCancel={() => setIsEditingProject(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isCreatingTask && selectedProject && (
          <TaskForm
            projectId={selectedProject.id}
            team={selectedProject.team}
            onSubmit={addTask}
            onCancel={() => setIsCreatingTask(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>{selectedTaskId && selectedProject && tasks.find(t => t.id === selectedTaskId) && <TaskDetailModal task={tasks.find(t => t.id === selectedTaskId)!} onClose={() => setSelectedTaskId(null)} onUpdate={updates => updateTask(selectedProject.id, selectedTaskId, updates)} onAddComment={text => addComment(selectedProject.id, selectedTaskId, text)} />}</AnimatePresence>
      <ConfirmModal isOpen={confirmConfig.isOpen} title={confirmConfig.title} message={confirmConfig.message} type={confirmConfig.type} onConfirm={confirmConfig.onConfirm} onClose={() => setConfirmConfig(p => ({ ...p, isOpen: false }))} />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
