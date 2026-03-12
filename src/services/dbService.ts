import { supabase } from '../lib/supabase';
import { Project, Task, Message, User, TaskStatus, Priority, ProjectStatus, UserRole } from '../types';

export const dbService = {
  // Projects
  async getProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select('*, team:project_members(profiles(*)), tasks(count)')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data.map(p => ({
      ...p,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      isMain: p.is_main,
      createdBy: p.created_by,
      team: p.team?.map((m: any) => m.profiles) || [],
      taskCount: p.tasks?.[0]?.count || 0,
      completedCount: 0,
      telegramBotToken: p.telegram_bot_token,
      telegramChatId: p.telegram_chat_id
    })) as (Project & { taskCount: number, completedCount: number })[];
  },

  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'team'>) {
    const { data, error } = await supabase
      .from('projects')
      .insert([{
        name: project.name,
        description: project.description,
        status: project.status,
        is_main: project.isMain,
        created_by: project.createdBy,
        notes: project.notes,
        category: project.category,
        budget: project.budget,
        start_date: project.startDate,
        end_date: project.endDate,
        github_url: project.githubUrl,
        domain_url: project.domainUrl,
        telegram_bot_token: project.telegramBotToken,
        telegram_chat_id: project.telegramChatId
      }])
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      isMain: data.is_main,
      createdBy: data.created_by,
      telegramBotToken: data.telegram_bot_token,
      telegramChatId: data.telegram_chat_id
    } as Project;
  },

  async updateProject(id: string, updates: Partial<Project>) {
    const mappedUpdates: any = {};
    if (updates.name !== undefined) mappedUpdates.name = updates.name;
    if (updates.description !== undefined) mappedUpdates.description = updates.description;
    if (updates.status !== undefined) mappedUpdates.status = updates.status;
    if (updates.notes !== undefined) mappedUpdates.notes = updates.notes;
    if (updates.category !== undefined) mappedUpdates.category = updates.category;
    if (updates.budget !== undefined) mappedUpdates.budget = updates.budget;
    if (updates.isMain !== undefined) mappedUpdates.is_main = updates.isMain;
    if (updates.createdBy) mappedUpdates.created_by = updates.createdBy;
    if (updates.startDate) mappedUpdates.start_date = updates.startDate;
    if (updates.endDate) mappedUpdates.end_date = updates.endDate;
    if (updates.telegramBotToken !== undefined) mappedUpdates.telegram_bot_token = updates.telegramBotToken;
    if (updates.telegramChatId !== undefined) mappedUpdates.telegram_chat_id = updates.telegramChatId;
    if (updates.githubUrl) mappedUpdates.github_url = updates.githubUrl;
    if (updates.domainUrl) mappedUpdates.domain_url = updates.domainUrl;
    if (updates.updatedAt) mappedUpdates.updated_at = updates.updatedAt;

    const { data, error } = await supabase
      .from('projects')
      .update(mappedUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      isMain: data.is_main,
      createdBy: data.created_by
    } as Project;
  },

  async deleteProject(id: string) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Tasks
  async getTasks(projectId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data.map(t => ({
      ...t,
      projectId: t.project_id,
      createdAt: t.created_at,
      dueDate: t.due_date,
      assignedTo: t.assigned_to,
      parentId: t.parent_id,
      estimatedHours: t.estimated_hours,
      actualHours: t.actual_hours
    })) as Task[];
  },

  async createTask(task: Omit<Task, 'id' | 'createdAt'>) {
    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        project_id: task.projectId,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        comments: task.comments,
        due_date: task.dueDate,
        assigned_to: task.assignedTo,
        parent_id: task.parentId,
        estimated_hours: task.estimatedHours,
        actual_hours: task.actualHours
      }])
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      projectId: data.project_id,
      createdAt: data.created_at,
      dueDate: data.due_date,
      assignedTo: data.assigned_to,
      parentId: data.parent_id,
      estimatedHours: data.estimated_hours,
      actualHours: data.actual_hours
    } as Task;
  },

  async updateTask(id: string, updates: Partial<Task>) {
    const mappedUpdates: any = {};
    if (updates.title !== undefined) mappedUpdates.title = updates.title;
    if (updates.description !== undefined) mappedUpdates.description = updates.description;
    if (updates.status !== undefined) mappedUpdates.status = updates.status;
    if (updates.priority !== undefined) mappedUpdates.priority = updates.priority;
    if (updates.comments !== undefined) mappedUpdates.comments = updates.comments;
    if (updates.projectId) mappedUpdates.project_id = updates.projectId;
    if (updates.dueDate !== undefined) mappedUpdates.due_date = updates.dueDate;
    if (updates.assignedTo) mappedUpdates.assigned_to = updates.assignedTo;
    if (updates.parentId) mappedUpdates.parent_id = updates.parentId;
    if (updates.estimatedHours) mappedUpdates.estimated_hours = updates.estimatedHours;
    if (updates.actualHours) mappedUpdates.actual_hours = updates.actualHours;

    const { data, error } = await supabase
      .from('tasks')
      .update(mappedUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      projectId: data.project_id,
      createdAt: data.created_at,
      dueDate: data.due_date,
      assignedTo: data.assigned_to,
      parentId: data.parent_id,
      estimatedHours: data.estimated_hours,
      actualHours: data.actual_hours
    } as Task;
  },

  async deleteTask(id: string) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Messages (Chat)
  async getMessages(projectId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('*, profiles(*)')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data.map(m => ({
      ...m,
      projectId: m.project_id,
      userId: m.user_id,
      createdAt: m.created_at
    })) as Message[];
  },

  async sendMessage(message: Omit<Message, 'id' | 'createdAt'>) {
    const { data, error } = await supabase
      .from('messages')
      .insert([{
        project_id: message.projectId,
        user_id: message.userId,
        text: message.text
      }])
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      projectId: data.project_id,
      userId: data.user_id,
      createdAt: data.created_at
    } as Message;
  },

  subscribeToMessages(projectId: string, onMessage: (message: Message) => void) {
    return supabase
      .channel(`project:${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `project_id=eq.${projectId}`,
        },
        async (payload) => {
          // Fetch profile for the new message
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', payload.new.user_id)
            .maybeSingle();

          onMessage({
            ...payload.new,
            projectId: payload.new.project_id,
            userId: payload.new.user_id,
            createdAt: payload.new.created_at,
            profiles: profile
          } as any as Message);
        }
      )
      .subscribe();
  },

  // Profiles
  async getProfilesCount() {
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    return count || 0;
  },

  async getAllProfiles() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data as User[];
  },

  async deleteProfile(userId: string) {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) throw error;
  },

  async updateProfileRole(userId: string, role: UserRole) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as User;
  },

  async updateProfile(userId: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as User;
  },

  async createProfile(id: string, username: string, name: string, email: string, role: UserRole) {
    const { data, error } = await supabase
      .from('profiles')
      .insert([{ id, username, name, email, role }])
      .select()
      .single();

    if (error) throw error;
    return data as User;
  },

  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data as User | null;
  },

  async addProjectMember(projectId: string, username: string) {
    // Strip @ if present and clean up
    const cleanUsername = username.trim().replace(/^@/, '').toLowerCase();

    // First find the user by username
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', cleanUsername)
      .maybeSingle();

    if (profileError || !profile) {
      throw new Error(`Foydalanuvchi topilmadi: @${cleanUsername}`);
    }

    const { error } = await supabase
      .from('project_members')
      .insert([{ project_id: projectId, user_id: profile.id }]);

    if (error) {
      if (error.code === '23505') throw new Error('Ushbu foydalanuvchi allaqachon a\'zo');
      throw error;
    }
  },

  // Notifications
  async getNotifications() {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data;
  },

  async markNotificationAsRead(id: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (error) throw error;
  },

  async createNotification(notif: { userId: string, projectId: string | null, type: string, title: string, message: string }) {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notif])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  subscribeToNotifications(onNotification: (notif: any) => void) {
    return supabase
      .channel('notifications_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => onNotification(payload.new)
      )
      .subscribe((status) => {
        console.log('Realtime Notification Status:', status);
      });
  },

  subscribeToTable(table: string, callback: (payload: any) => void) {
    return supabase
      .channel(`${table}_realtime`)
      .on(
        'postgres_changes',
        {
          event: '*', // All events: INSERT, UPDATE, DELETE
          schema: 'public',
          table: table,
        },
        (payload) => {
          console.log(`Realtime change in ${table}:`, payload);
          callback(payload);
        }
      )
      .subscribe((status) => {
        console.log(`Realtime ${table} Status:`, status);
      });
  }
};
