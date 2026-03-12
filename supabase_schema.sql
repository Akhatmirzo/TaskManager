-- 1. Profiles Table
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar TEXT,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'Member' CHECK (role IN ('Admin', 'Member', 'Viewer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Projects Table
CREATE TABLE public.projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'Idea' CHECK (status IN ('Idea', 'In Progress', 'Completed', 'On Hold')),
    is_main BOOLEAN DEFAULT false,
    created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    notes TEXT,
    category TEXT,
    budget TEXT,
    start_date DATE,
    end_date DATE,
    github_url TEXT,
    domain_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tasks Table
CREATE TABLE public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'To Do' CHECK (status IN ('To Do', 'In Progress', 'Review', 'Done')),
    priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
    comments JSONB DEFAULT '[]',
    due_date TIMESTAMP WITH TIME ZONE,
    assigned_to UUID REFERENCES public.profiles(id),
    parent_id UUID REFERENCES public.tasks(id),
    estimated_hours NUMERIC,
    actual_hours NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Messages (Chat) Table
CREATE TABLE public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Project Members Table
CREATE TABLE public.project_members (
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    PRIMARY KEY (project_id, user_id)
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- Creating Policies (Simplified for development)
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Projects access" ON public.projects 
FOR SELECT USING (
    auth.uid() = created_by OR 
    EXISTS (SELECT 1 FROM public.project_members WHERE project_id = id AND user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin')
);
CREATE POLICY "Users can insert projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Owners can update projects" ON public.projects FOR UPDATE USING (auth.uid() = created_by OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin'));
CREATE POLICY "Owners can delete projects" ON public.projects FOR DELETE USING (auth.uid() = created_by OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin'));

CREATE POLICY "Tasks access" ON public.tasks 
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.projects 
        WHERE id = public.tasks.project_id AND (
            created_by = auth.uid() OR 
            EXISTS (SELECT 1 FROM public.project_members WHERE project_id = projects.id AND user_id = auth.uid()) OR
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin')
        )
    )
);

CREATE POLICY "Messages access" ON public.messages 
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.projects 
        WHERE id = public.messages.project_id AND (
            created_by = auth.uid() OR 
            EXISTS (SELECT 1 FROM public.project_members WHERE project_id = projects.id AND user_id = auth.uid()) OR
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin')
        )
    )
);

CREATE POLICY "Manage members" ON public.project_members 
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.projects 
        WHERE id = public.project_members.project_id AND (
            created_by = auth.uid() OR 
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin')
        )
    )
);
