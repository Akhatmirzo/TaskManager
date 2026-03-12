-- 1. Drop existing permissive policies (if they exist)
DROP POLICY IF EXISTS "Projects are viewable by participants" ON public.projects;
DROP POLICY IF EXISTS "Projects access" ON public.projects;
DROP POLICY IF EXISTS "Users can insert projects" ON public.projects;
DROP POLICY IF EXISTS "Owners can update projects" ON public.projects;
DROP POLICY IF EXISTS "Owners can delete projects" ON public.projects;

DROP POLICY IF EXISTS "Anyone can see tasks" ON public.tasks;
DROP POLICY IF EXISTS "Manage tasks" ON public.tasks;
DROP POLICY IF EXISTS "Tasks access" ON public.tasks;

DROP POLICY IF EXISTS "Anyone can see messages" ON public.messages;
DROP POLICY IF EXISTS "Anyone can send messages" ON public.messages;
DROP POLICY IF EXISTS "Messages access" ON public.messages;

DROP POLICY IF EXISTS "Manage members" ON public.project_members;

-- 2. Create Restrictive Policies

-- Projects
CREATE POLICY "Projects access" ON public.projects 
FOR SELECT USING (
    auth.uid() = created_by OR 
    EXISTS (SELECT 1 FROM public.project_members WHERE project_id = id AND user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin')
);
CREATE POLICY "Users can insert projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Owners can update projects" ON public.projects FOR UPDATE USING (auth.uid() = created_by OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin'));
CREATE POLICY "Owners can delete projects" ON public.projects FOR DELETE USING (auth.uid() = created_by OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin'));

-- Tasks
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

-- Messages (Chat)
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

-- Project Members
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
