-- 1. Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    is_admin boolean;
    username_val text;
    full_name_val text;
    avatar_url_val text;
BEGIN
    -- Check if this is the first user
    SELECT (COUNT(*) = 0) INTO is_admin FROM public.profiles;

    -- Extract metadata from Google or other providers
    full_name_val := COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));
    avatar_url_val := COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture');
    username_val := COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1));

    INSERT INTO public.profiles (id, username, name, email, avatar, role)
    VALUES (
        new.id,
        username_val,
        full_name_val,
        new.email,
        avatar_url_val,
        CASE WHEN is_admin THEN 'Admin' ELSE 'Member' END
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Function to automatically add project creator as a member
CREATE OR REPLACE FUNCTION public.handle_new_project()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.project_members (project_id, user_id)
    VALUES (new.id, new.created_by);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Trigger for new project creation
DROP TRIGGER IF EXISTS on_project_created ON public.projects;
CREATE TRIGGER on_project_created
    AFTER INSERT ON public.projects
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_project();
