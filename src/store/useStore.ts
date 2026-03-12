import { create } from 'zustand';
import { Project, User, UserRole } from '../types';

interface AppState {
    // Auth & Profile
    session: any | null;
    profile: User | null;
    setSession: (session: any | null) => void;
    setProfile: (profile: User | null) => void;

    // Navigation & UI
    activeTab: 'tasks' | 'kanban' | 'chat' | 'stats' | 'calendar' | 'team' | 'users';
    setActiveTab: (tab: AppState['activeTab']) => void;

    selectedProjectId: string | null;
    setSelectedProjectId: (id: string | null) => void;

    selectedTaskId: string | null;
    setSelectedTaskId: (id: string | null) => void;

    isSidebarOpen: boolean;
    setIsSidebarOpen: (isOpen: boolean) => void;

    showNotifPanel: boolean;
    setShowNotifPanel: (show: boolean) => void;

    isCreatingProject: boolean;
    setIsCreatingProject: (isCreating: boolean) => void;

    isEditingProject: boolean;
    setIsEditingProject: (isEditing: boolean) => void;

    searchQuery: string;
    setSearchQuery: (query: string) => void;

    viewMode: 'grid' | 'list' | 'kanban';
    setViewMode: (mode: 'grid' | 'list' | 'kanban') => void;

    confirmConfig: {
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        type?: 'danger' | 'info';
    };
    setConfirmConfig: (config: AppState['confirmConfig'] | ((prev: AppState['confirmConfig']) => AppState['confirmConfig'])) => void;

}

export const useStore = create<AppState>((set) => ({
    session: null,
    profile: null,
    setSession: (session) => set({ session }),
    setProfile: (profile) => set({ profile }),

    activeTab: 'tasks',
    setActiveTab: (activeTab) => set({ activeTab }),

    selectedProjectId: null,
    setSelectedProjectId: (selectedProjectId) => set({ selectedProjectId }),

    selectedTaskId: null,
    setSelectedTaskId: (selectedTaskId) => set({ selectedTaskId }),

    isSidebarOpen: false,
    setIsSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),

    showNotifPanel: false,
    setShowNotifPanel: (showNotifPanel) => set({ showNotifPanel }),

    isCreatingProject: false,
    setIsCreatingProject: (isCreatingProject) => set({ isCreatingProject }),

    isEditingProject: false,
    setIsEditingProject: (isEditingProject) => set({ isEditingProject }),

    searchQuery: '',
    setSearchQuery: (searchQuery) => set({ searchQuery }),

    viewMode: 'grid',
    setViewMode: (viewMode) => set({ viewMode }),

    confirmConfig: {
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
    },
    setConfirmConfig: (config) => set((state) => ({
        confirmConfig: typeof config === 'function' ? config(state.confirmConfig) : config
    })),

}));
