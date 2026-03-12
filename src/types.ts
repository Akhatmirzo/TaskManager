export enum ProjectStatus {
  IDEA = 'Idea',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  ON_HOLD = 'On Hold'
}

export enum TaskStatus {
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  REVIEW = 'Review',
  DONE = 'Done'
}

export enum Priority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export enum UserRole {
  ADMIN = 'Admin',
  MEMBER = 'Member',
  VIEWER = 'Viewer'
}

export interface User {
  id: string;
  username: string;
  name: string;
  avatar?: string;
  email: string;
  role: UserRole;
}

export interface Comment {
  id: string;
  text: string;
  createdAt: string;
  userId: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  comments: Comment[];
  dueDate?: string;
  assignedTo?: string; // User ID
  parentId?: string; // For subtasks
  estimatedHours?: number;
  actualHours?: number;
  createdAt: string;
}

export interface Message {
  id: string;
  projectId: string;
  userId: string;
  text: string;
  createdAt: string;
}

export interface TimeEntry {
  id: string;
  taskId: string;
  userId: string;
  startTime: string;
  endTime?: string;
  duration: number; // in seconds
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  status: 'Planned' | 'In Development' | 'Done';
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  startDate?: string;
  endDate?: string;
  githubUrl?: string;
  domainUrl?: string;
  notes: string;
  category?: string;
  budget?: string;
  isMain?: boolean;
  telegramBotToken?: string;
  telegramChatId?: string;
  createdBy: string;
  team?: User[];
}
