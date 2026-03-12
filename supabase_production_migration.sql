-- ==========================================
-- PROMANAGER: PRODUCTION MIGRATION (NON-DESTRUCTIVE)
-- ==========================================
-- Ushbu kodni Supabase SQL Editor-da ishga tushiring.
-- Bu mavjud ma'lumotlarni o'chirmaydi, faqat kerakli ustunni qo'shadi.

-- 1. Profiles jadvaliga telegram_username qo'shish
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS telegram_username TEXT;

-- 2. Telegram xabarlar navbati jadvalini yaratish (agar yo'q bo'lsa)
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

-- 3. Xavfsizlik qoidasini qo'shish
ALTER TABLE public.telegram_queue ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role access" ON public.telegram_queue;
CREATE POLICY "Service role access" ON public.telegram_queue FOR ALL USING (true); -- Edge functionlar uchun

-- Ruxsatlarni yangilash
GRANT ALL ON public.telegram_queue TO authenticated;
GRANT ALL ON public.telegram_queue TO service_role;
