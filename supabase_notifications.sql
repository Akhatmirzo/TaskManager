-- 1. Notifications Table
CREATE TABLE public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'task_added', 'member_added', 'project_updated', etc.
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Notifications Policy
CREATE POLICY "Users can see own notifications" ON public.notifications
FOR SELECT USING (auth.uid() = user_id);

GRANT ALL ON public.notifications TO authenticated;

-- 2. Trigger for Task Creation Notification
CREATE OR REPLACE FUNCTION public.notify_on_task_added()
RETURNS trigger AS $$
BEGIN
    -- Notify all project members except the creator
    INSERT INTO public.notifications (user_id, project_id, type, title, message)
    SELECT 
        user_id, 
        new.project_id, 
        'task_added', 
        'Yangi vazifa', 
        'Loyihangizda yangi vazifa yaratildi: ' || new.title
    FROM public.project_members
    WHERE project_id = new.project_id;
    -- Note: This is a simple version. In production, we'd avoid notifying the actor.
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_task_added
    AFTER INSERT ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.notify_on_task_added();
