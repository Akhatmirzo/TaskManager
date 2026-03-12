-- ==========================================
-- PROMANAGER: COMPLETE DATABASE SETUP SCRIPT (SUPER SETUP)
-- ==========================================
-- Ushbu script jadvallar, avtomatizatsiya, Telegram xabarnomalari 
-- va xavfsizlik qoidalarini birgalikda o'rnatadi.

-- 1. JADVALLAR (SCHEMA)
-- ------------------------------------------

-- Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar TEXT,
    email TEXT UNIQUE NOT NULL,
    telegram_username TEXT,
    role TEXT DEFAULT 'Member' CHECK (role IN ('Admin', 'Member', 'Viewer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
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
    telegram_bot_token TEXT,
    telegram_chat_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
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
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Project Members Table
CREATE TABLE IF NOT EXISTS public.project_members (
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    PRIMARY KEY (project_id, user_id)
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Telegram Habarlar Navbati (Queue)
CREATE TABLE IF NOT EXISTS public.telegram_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    bot_token TEXT NOT NULL,
    chat_id TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function: Loyiha yaratuvchisini jamoaga avtomatik qo'shish
CREATE OR REPLACE FUNCTION public.handle_new_project()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.project_members (project_id, user_id) VALUES (new.id, new.created_by);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_project_created ON public.projects;
CREATE TRIGGER on_project_created AFTER INSERT ON public.projects FOR EACH ROW EXECUTE FUNCTION public.handle_new_project();

-- Function: Ichki notifikatsiya yuborish (Vazifa qo'shilganda)
CREATE OR REPLACE FUNCTION public.notify_on_task_added()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.notifications (user_id, project_id, type, title, message)
    SELECT user_id, new.project_id, 'task_added', 'Yangi vazifa', 'Loyihangizda yangi vazifa yaratildi: ' || new.title
    FROM public.project_members WHERE project_id = new.project_id AND user_id != auth.uid();
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_task_added ON public.tasks;
CREATE TRIGGER on_task_added AFTER INSERT ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.notify_on_task_added();

-- Function: Telegramga vazifa xabarini yuborish
CREATE OR REPLACE FUNCTION public.notify_telegram_on_task_create()
RETURNS trigger AS $$
DECLARE
    v_bot_token TEXT;
    v_chat_id TEXT;
    v_project_name TEXT;
    v_assignee_tg TEXT;
    v_message TEXT;
BEGIN
    SELECT name, telegram_bot_token, telegram_chat_id INTO v_project_name, v_bot_token, v_chat_id
    FROM public.projects WHERE id = NEW.project_id;
    IF v_bot_token IS NOT NULL AND v_chat_id IS NOT NULL THEN
        IF NEW.assigned_to IS NOT NULL THEN
            SELECT telegram_username INTO v_assignee_tg FROM public.profiles WHERE id = NEW.assigned_to;
        END IF;
        v_message := '🆕 *Yangi Vazifa Yaratildi*' || CHR(10) || '📌 Loyiha: ' || v_project_name || CHR(10) || '📝 Vazifa: ' || NEW.title || CHR(10) || '🔴 Prioritet: ' || NEW.priority || CHR(10);
        IF NEW.description IS NOT NULL AND NEW.description != '' THEN v_message := v_message || 'ℹ️ Tavsif: ' || NEW.description || CHR(10); END IF;
        IF NEW.due_date IS NOT NULL THEN v_message := v_message || '⏰ Muddat: ' || TO_CHAR(NEW.due_date, 'DD.MM.YYYY HH24:MI') || CHR(10); END IF;
        IF v_assignee_tg IS NOT NULL AND v_assignee_tg != '' THEN v_message := v_message || CHR(10) || '👤 @' || REPLACE(v_assignee_tg, '@', '') || ' sen uchun!'; END IF;
        INSERT INTO public.telegram_queue (project_id, bot_token, chat_id, message) VALUES (NEW.project_id, v_bot_token, v_chat_id, v_message);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_task_created_telegram ON public.tasks;
CREATE TRIGGER on_task_created_telegram AFTER INSERT ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.notify_telegram_on_task_create();

-- Function: Deadline eslatmalarini tekshirish
CREATE OR REPLACE FUNCTION public.check_task_deadlines()
RETURNS void AS $$
DECLARE
    r RECORD;
    v_message TEXT;
    v_remind_type TEXT;
BEGIN
    FOR r IN SELECT t.*, p.name as project_name, p.telegram_bot_token, p.telegram_chat_id, pr.telegram_username FROM public.tasks t JOIN public.projects p ON t.project_id = p.id LEFT JOIN public.profiles pr ON t.assigned_to = pr.id WHERE t.status != 'Done' AND t.due_date IS NOT NULL AND p.telegram_bot_token IS NOT NULL AND p.telegram_chat_id IS NOT NULL LOOP
        IF r.due_date BETWEEN (now() + interval '23 hours') AND (now() + interval '24 hours') THEN v_remind_type := '⚠️ *1 kun qoldi!*';
        ELSIF r.due_date BETWEEN (now() + interval '11 hours') AND (now() + interval '12 hours') THEN v_remind_type := '🕒 *12 soat qoldi!*';
        ELSIF r.due_date BETWEEN (now() + interval '5 hours') AND (now() + interval '6 hours') THEN v_remind_type := '🚨 *Faqat 6 soat qoldi!*';
        ELSIF r.due_date < now() AND r.due_date > (now() - interval '1 hour') THEN v_remind_type := '🧨 *MUDDAT TUGADI!*';
        ELSE CONTINUE; END IF;
        v_message := v_remind_type || CHR(10) || '📌 Loyiha: ' || r.project_name || CHR(10) || '📝 Vazifa: ' || r.title || CHR(10) || '⏰ Muddat: ' || TO_CHAR(r.due_date, 'DD.MM.YYYY HH24:MI');
        IF r.telegram_username IS NOT NULL AND r.telegram_username != '' THEN v_message := v_message || CHR(10) || CHR(10) || '👤 @' || REPLACE(r.telegram_username, '@', '') || ' shoshiling!'; END IF;
        INSERT INTO public.telegram_queue (project_id, bot_token, chat_id, message) VALUES (r.project_id, r.telegram_bot_token, r.telegram_chat_id, v_message);
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. MAXFIYLIK (SECURITY POLICIES)
-- ------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_queue ENABLE ROW LEVEL SECURITY;

-- Rekursiyani oldini olish uchun yordamchi funksiyalar
CREATE OR REPLACE FUNCTION public.check_project_access(p_id UUID)
RETURNS boolean AS $$
BEGIN
  RETURN (EXISTS (SELECT 1 FROM public.projects WHERE id = p_id AND created_by = auth.uid()) OR EXISTS (SELECT 1 FROM public.project_members WHERE project_id = p_id AND user_id = auth.uid()) OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.check_is_project_owner(p_id UUID)
RETURNS boolean AS $$
BEGIN
  RETURN (EXISTS (SELECT 1 FROM public.projects WHERE id = p_id AND created_by = auth.uid()) OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies
CREATE POLICY "Profiles visibility" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Profiles update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Projects select" ON public.projects FOR SELECT USING (public.check_project_access(id));
CREATE POLICY "Projects insert" ON public.projects FOR INSERT WITH CHECK (auth.uid() = created_by OR created_by IS NULL);
CREATE POLICY "Projects update" ON public.projects FOR UPDATE USING (public.check_is_project_owner(id));
CREATE POLICY "Projects delete" ON public.projects FOR DELETE USING (public.check_is_project_owner(id));

CREATE POLICY "Tasks select" ON public.tasks FOR SELECT USING (public.check_project_access(project_id));
CREATE POLICY "Tasks insert" ON public.tasks FOR INSERT WITH CHECK (public.check_project_access(project_id));
CREATE POLICY "Tasks update" ON public.tasks FOR UPDATE USING (public.check_project_access(project_id));
CREATE POLICY "Tasks delete" ON public.tasks FOR DELETE USING (public.check_project_access(project_id));

CREATE POLICY "Messages select" ON public.messages FOR SELECT USING (public.check_project_access(project_id));
CREATE POLICY "Messages insert" ON public.messages FOR INSERT WITH CHECK (public.check_project_access(project_id) AND auth.uid() = user_id);

CREATE POLICY "Members select" ON public.project_members FOR SELECT USING (public.check_project_access(project_id));
CREATE POLICY "Members insert" ON public.project_members FOR INSERT WITH CHECK (public.check_is_project_owner(project_id));
CREATE POLICY "Members delete" ON public.project_members FOR DELETE USING (public.check_is_project_owner(project_id));

CREATE POLICY "Users can see own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- 4. GRANTS (RUXSATLAR)
-- ------------------------------------------

GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;
