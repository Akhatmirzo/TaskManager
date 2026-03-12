-- ==========================================
-- PROMANAGER: REALTIME CONFIGURATION
-- ==========================================
-- Ushbu script jadvallarni "supabase_realtime" publication'ga qo'shadi.
-- Bu "postgres_changes" (real-time sync) ishlashi uchun SHART.

-- 1. Realtime'ni jadvallar uchun yoqish
-- Agar jadval allaqachon qo'shilgan bo'lsa, xatolik bermasligi uchun alohida bajaramiz.

-- 0. Publication mavjudligini tekshirish va yaratish
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;
END $$;

-- 1. Realtime'ni jadvallar uchun yoqish
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'projects'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE projects;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'tasks'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE messages;
    END IF;
END $$;

-- 2. REPLICA IDENTITY (UPDATE va DELETE uchun to'liq ma'lumot olish)
ALTER TABLE public.projects REPLICA IDENTITY FULL;
ALTER TABLE public.tasks REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- 2. RLS xavfsizligini tekshirish (Realtime RLS'ni hurmat qiladi)
-- Foydalanuvchi faqat o'zi ruxsati bor qatorlardagi o'zgarishlarni ko'ra oladi.
