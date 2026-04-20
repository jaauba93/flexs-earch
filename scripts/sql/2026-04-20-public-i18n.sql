-- Colliers Flex — public i18n foundation for bulk export/import
-- Run in Supabase SQL editor before importing listings_translations,
-- amenities_translations, public_ui_translations and page_content_translations.

ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS name_en text,
  ADD COLUMN IF NOT EXISTS name_uk text,
  ADD COLUMN IF NOT EXISTS description_en text,
  ADD COLUMN IF NOT EXISTS description_uk text;

ALTER TABLE amenities
  ADD COLUMN IF NOT EXISTS name_uk text;

CREATE TABLE IF NOT EXISTS public_site_translations (
  key text PRIMARY KEY,
  value_pl text,
  value_en text,
  value_uk text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION set_public_site_translations_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS public_site_translations_set_updated_at ON public_site_translations;

CREATE TRIGGER public_site_translations_set_updated_at
BEFORE UPDATE ON public_site_translations
FOR EACH ROW
EXECUTE FUNCTION set_public_site_translations_updated_at();
