-- ==========================================
-- PROMANAGER: TELEGRAM & DEADLINE SETUP
-- ==========================================

-- 1. Projects jadvaliga Telegram sozlamalarini qo'shish
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS telegram_bot_token TEXT,
ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT;

-- 2. Telegram xabarini yuborish uchun yordamchi funksiya (Edge Function chaqirish uchun tayyorgarlik)
-- Eslatma: Supabase-dan bevosita Telegram-ga xabar yuborish uchun Edge Functions tavsiya etiladi.
-- Quyidagi trigger faqat vazifa holati o'zgarganda xabar berishi mumkin.

CREATE OR REPLACE FUNCTION public.notify_telegram_on_task_done()
RETURNS trigger AS $$
BEGIN
    -- Faqat vazifa "Done" bo'lganda va bot sozlamalari mavjud bo'lsa xabar yuboramiz
    IF NEW.status = 'Done' AND OLD.status != 'Done' THEN
        -- Botga yuborish logikasi bu yerda (Edge Function chaqiruvi yoki HTTP so'rov)
        -- Hozircha bu faqat tayyorgarlik.
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
