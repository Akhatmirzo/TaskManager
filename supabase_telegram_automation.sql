-- ======================================================
-- PROMANAGER: TELEGRAM AUTOMATION & ANALYTICS
-- ======================================================

-- 1. Telegram Habarlar Navbati (Queue)
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

-- 2. Vazifa yaratilganda Telegramga notif yuborish
CREATE OR REPLACE FUNCTION public.notify_telegram_on_task_create()
RETURNS trigger AS $$
DECLARE
    v_bot_token TEXT;
    v_chat_id TEXT;
    v_project_name TEXT;
    v_assignee_tg TEXT;
    v_message TEXT;
BEGIN
    -- Loyiha malumotlarini olish
    SELECT name, telegram_bot_token, telegram_chat_id 
    INTO v_project_name, v_bot_token, v_chat_id
    FROM public.projects WHERE id = NEW.project_id;

    -- Agar Telegram sozlamalari bo'lsa
    IF v_bot_token IS NOT NULL AND v_chat_id IS NOT NULL THEN
        -- Assignee telegram username-ni olish
        IF NEW.assigned_to IS NOT NULL THEN
            SELECT telegram_username INTO v_assignee_tg 
            FROM public.profiles WHERE id = NEW.assigned_to;
        END IF;

        v_message := '🆕 *Yangi Vazifa Yaratildi*' || CHR(10) ||
                    '📌 Loyiha: ' || v_project_name || CHR(10) ||
                    '📝 Vazifa: ' || NEW.title || CHR(10) ||
                    '🔴 Prioritet: ' || NEW.priority || CHR(10);
        
        IF NEW.description IS NOT NULL AND NEW.description != '' THEN
            v_message := v_message || 'ℹ️ Tavsif: ' || NEW.description || CHR(10);
        END IF;

        IF NEW.due_date IS NOT NULL THEN
            v_message := v_message || '⏰ Muddat: ' || TO_CHAR(NEW.due_date, 'DD.MM.YYYY HH24:MI') || CHR(10);
        END IF;

        IF v_assignee_tg IS NOT NULL AND v_assignee_tg != '' THEN
            v_message := v_message || CHR(10) || '👤 @' || REPLACE(v_assignee_tg, '@', '') || ' sen uchun!';
        END IF;

        -- Navbatga qo'shish
        INSERT INTO public.telegram_queue (project_id, bot_token, chat_id, message)
        VALUES (NEW.project_id, v_bot_token, v_chat_id, v_message);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_task_created_telegram ON public.tasks;
CREATE TRIGGER on_task_created_telegram
    AFTER INSERT ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.notify_telegram_on_task_create();

-- 3. Deadline-larni tekshirish funksiyasi (Cron yoki manual chaqirish uchun)
-- Bu funksiya har soatda chaqirilishi kerak
CREATE OR REPLACE FUNCTION public.check_task_deadlines()
RETURNS void AS $$
DECLARE
    r RECORD;
    v_message TEXT;
    v_remind_type TEXT;
BEGIN
    FOR r IN 
        SELECT t.*, p.name as project_name, p.telegram_bot_token, p.telegram_chat_id, pr.telegram_username
        FROM public.tasks t
        JOIN public.projects p ON t.project_id = p.id
        LEFT JOIN public.profiles pr ON t.assigned_to = pr.id
        WHERE t.status != 'Done' 
          AND t.due_date IS NOT NULL
          AND p.telegram_bot_token IS NOT NULL
          AND p.telegram_chat_id IS NOT NULL
    LOOP
        -- 1 kun (24h) qolganda
        IF r.due_date BETWEEN (now() + interval '23 hours') AND (now() + interval '24 hours') THEN
            v_remind_type := '⚠️ *1 kun qoldi!*';
        -- 12 soat qolganda
        ELSIF r.due_date BETWEEN (now() + interval '11 hours') AND (now() + interval '12 hours') THEN
            v_remind_type := '🕒 *12 soat qoldi!*';
        -- 6 soat qolganda
        ELSIF r.due_date BETWEEN (now() + interval '5 hours') AND (now() + interval '6 hours') THEN
            v_remind_type := '🚨 *Faqat 6 soat qoldi!*';
        -- Deadline o'tib ketgan bo'lsa (faqat bir marta)
        ELSIF r.due_date < now() AND r.due_date > (now() - interval '1 hour') THEN
            v_remind_type := '🧨 *MUDDAT TUGADI!*';
        ELSE
            CONTINUE;
        END IF;

        v_message := v_remind_type || CHR(10) ||
                    '📌 Loyiha: ' || r.project_name || CHR(10) ||
                    '📝 Vazifa: ' || r.title || CHR(10) ||
                    '⏰ Muddat: ' || TO_CHAR(r.due_date, 'DD.MM.YYYY HH24:MI');

        IF r.telegram_username IS NOT NULL AND r.telegram_username != '' THEN
            v_message := v_message || CHR(10) || CHR(10) || '👤 @' || REPLACE(r.telegram_username, '@', '') || ' shoshiling!';
        END IF;

        INSERT INTO public.telegram_queue (project_id, bot_token, chat_id, message)
        VALUES (r.project_id, r.telegram_bot_token, r.telegram_chat_id, v_message);
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
