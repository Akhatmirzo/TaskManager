-- ⚠️ DIQQAT: USHBU KOD BARCHA JADVALLAR VA MA'LUMOTLARNI O'CHIRIB TASHLAYDI!
-- ⚠️ WARNING: THIS WILL DELETE ALL TABLES AND DATA PERMANENTLY!

-- 1. Barcha jadvallarni va ularga bog'liq narsalarni o'chirish
DROP SCHEMA public CASCADE;

-- 2. "public" schemasini qaytadan yaratish
CREATE SCHEMA public;

-- 3. Ruxsatlarni tiklash (Supabase uchun muhim)
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO anon;
GRANT ALL ON SCHEMA public TO authenticated;
GRANT ALL ON SCHEMA public TO service_role;

-- Endi siz quyidagi tartibda qayta o'rnatishingiz mumkin:
-- 1. supabase_complete_setup.sql (Barcha jadvallar, triggerlar va politsiyalar birda)
