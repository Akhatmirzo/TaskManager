-- ==========================================
-- PROMANAGER: COMPLETE DATABASE SETUP SCRIPT
-- ==========================================
-- Ushbu script jadvallar, triggerlar va xavfsizlik (Privacy) 
-- qoidalarini birgalikda o'rnatadi.

-- 1. JADVALLAR (SCHEMA)
-- ------------------------------------------

-- Profiles Table
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar TEXT,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'Member' CHECK (role IN ('Admin', 'Member', 'Viewer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Projects Table
CREATE TABLE public.projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'Idea' CHECK (status IN ('Idea', 'In Progress', 'Completed', 'On Hold')),
    is_main BOOLEAN DEFAULT false,
    created_by UUID DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
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

-- Tasks Table
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

-- Messages (Chat) Table
CREATE TABLE public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    user_id UUID DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Project Members Table
CREATE TABLE public.project_members (
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    PRIMARY KEY (project_id, user_id)
);

-- 2. AVTOMATIZATSIYA (FUNCTIONS & TRIGGERS)
-- ------------------------------------------

-- Function: Yangi foydalanuvchini profillar jadvaliga qo'shish
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    is_admin boolean;
    username_val text;
    full_name_val text;
    avatar_url_val text;
BEGIN
    SELECT (COUNT(*) = 0) INTO is_admin FROM public.profiles;
    
    full_name_val := COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));
    avatar_url_val := COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture');
    username_val := COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1));

    INSERT INTO public.profiles (id, username, name, email, avatar, role)
    VALUES (new.id, username_val, full_name_val, new.email, avatar_url_val, CASE WHEN is_admin THEN 'Admin' ELSE 'Member' END);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function: Loyiha yaratuvchisini jamoaga avtomatik qo'shish
CREATE OR REPLACE FUNCTION public.handle_new_project()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.project_members (project_id, user_id) VALUES (new.id, new.created_by);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_project_created AFTER INSERT ON public.projects FOR EACH ROW EXECUTE FUNCTION public.handle_new_project();

-- 3. MAXFIYLIK (SECURITY POLICIES)
-- ------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- Rekursiyani oldini olish uchun yordamchi funksiyalar (SECURITY DEFINER)
-- Ushbu funksiyalar RLSni chetlab o'tib tekshiradi

-- Loyihaga kirish huquqini tekshirish (Egasi yoki Jamoa a'zosi)
CREATE OR REPLACE FUNCTION public.check_project_access(p_id UUID)
RETURNS boolean AS $$
BEGIN
  RETURN (
    EXISTS (SELECT 1 FROM public.projects WHERE id = p_id AND created_by = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.project_members WHERE project_id = p_id AND user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Loyiha egasi yoki Adminligini tekshirish
CREATE OR REPLACE FUNCTION public.check_is_project_owner(p_id UUID)
RETURNS boolean AS $$
BEGIN
  RETURN (
    EXISTS (SELECT 1 FROM public.projects WHERE id = p_id AND created_by = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Profiles visibility" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Profiles update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Projects Policies
CREATE POLICY "Projects select" ON public.projects FOR SELECT USING (public.check_project_access(id));
CREATE POLICY "Projects insert" ON public.projects FOR INSERT WITH CHECK (auth.uid() = created_by OR created_by IS NULL);
CREATE POLICY "Projects update" ON public.projects FOR UPDATE USING (public.check_is_project_owner(id));
CREATE POLICY "Projects delete" ON public.projects FOR DELETE USING (public.check_is_project_owner(id));

-- Tasks Policies
CREATE POLICY "Tasks select" ON public.tasks FOR SELECT USING (public.check_project_access(project_id));
CREATE POLICY "Tasks insert" ON public.tasks FOR INSERT WITH CHECK (public.check_project_access(project_id));
CREATE POLICY "Tasks update" ON public.tasks FOR UPDATE USING (public.check_project_access(project_id));
CREATE POLICY "Tasks delete" ON public.tasks FOR DELETE USING (public.check_project_access(project_id));

-- Messages Policies
CREATE POLICY "Messages select" ON public.messages FOR SELECT USING (public.check_project_access(project_id));
CREATE POLICY "Messages insert" ON public.messages FOR INSERT WITH CHECK (public.check_project_access(project_id) AND auth.uid() = user_id);

-- Project Members Policies
CREATE POLICY "Members select" ON public.project_members FOR SELECT USING (public.check_project_access(project_id));
CREATE POLICY "Members insert" ON public.project_members FOR INSERT WITH CHECK (public.check_is_project_owner(project_id));
CREATE POLICY "Members delete" ON public.project_members FOR DELETE USING (public.check_is_project_owner(project_id));

-- 4. GRANTS (RUXSATLAR)
-- ------------------------------------------

-- Supabase rollariga jadvallar bilan ishlashga ruxsat berish
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;
