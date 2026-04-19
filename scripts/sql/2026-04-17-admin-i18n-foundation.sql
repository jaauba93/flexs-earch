-- Colliers Flex — foundation for translated public content
-- Apply in Supabase SQL editor before turning on EN / UK content editing in production.

ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS name_en text,
  ADD COLUMN IF NOT EXISTS name_uk text,
  ADD COLUMN IF NOT EXISTS description_en text,
  ADD COLUMN IF NOT EXISTS description_uk text;
