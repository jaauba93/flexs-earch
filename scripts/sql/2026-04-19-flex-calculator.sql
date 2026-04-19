-- Colliers Flex calculator
-- Apply in Supabase SQL editor before opening /admin/flex-kalkulator in production.

CREATE TABLE IF NOT EXISTS flex_calculator_settings (
  id text PRIMARY KEY DEFAULT 'default',
  intro_eyebrow text NOT NULL DEFAULT 'Kalkulator flex',
  intro_title text NOT NULL,
  intro_body text NOT NULL,
  intro_disclaimer_approx text NOT NULL,
  intro_disclaimer_market text NOT NULL,
  intro_disclaimer_support text NOT NULL,
  default_headcount integer NOT NULL DEFAULT 150,
  default_city_slug text NOT NULL DEFAULT 'warszawa',
  default_location_type text NOT NULL DEFAULT 'cbd',
  default_fitout_standard text NOT NULL DEFAULT 'enhanced',
  default_density_key text NOT NULL DEFAULT 'spacious',
  default_flex_lease_months integer NOT NULL DEFAULT 12,
  default_conventional_lease_months integer NOT NULL DEFAULT 60,
  utilities_and_maintenance_eur_per_sqm numeric(10,2) NOT NULL DEFAULT 5,
  flex_common_area_sqm_per_desk numeric(10,2) NOT NULL DEFAULT 0.9,
  add_on_factor numeric(10,4) NOT NULL DEFAULT 1.06,
  rent_free_months_per_year numeric(10,2) NOT NULL DEFAULT 1,
  location_options jsonb NOT NULL DEFAULT '[{"value":"cbd","label":"Centrum"},{"value":"non_cbd","label":"Poza centrum"}]'::jsonb,
  fitout_options jsonb NOT NULL DEFAULT '[{"value":"basic","label":"Podstawowy"},{"value":"enhanced","label":"Wyższy"},{"value":"premium","label":"Premium"}]'::jsonb,
  flex_lease_options jsonb NOT NULL DEFAULT '[{"value":"12","label":"12 miesięcy"},{"value":"24","label":"24 miesiące"},{"value":"36","label":"36 miesięcy"}]'::jsonb,
  conventional_lease_options jsonb NOT NULL DEFAULT '[{"value":"60","label":"60 miesięcy"},{"value":"72","label":"72 miesiące"},{"value":"84","label":"84 miesiące"},{"value":"96","label":"96 miesięcy"},{"value":"108","label":"108 miesięcy"},{"value":"120","label":"120 miesięcy"}]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS flex_calculator_density_options (
  key text PRIMARY KEY,
  label text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  flex_office_sqm_per_desk numeric(10,2) NOT NULL,
  conventional_sqm_per_person_avg numeric(10,2) NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS flex_calculator_market_data (
  city_slug text PRIMARY KEY,
  city_label text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  headline_rent_cbd_eur numeric(10,2) NOT NULL,
  non_cbd_deduction_eur numeric(10,2) NOT NULL,
  service_charge_cbd_pln numeric(10,2) NOT NULL,
  service_charge_non_cbd_pln numeric(10,2) NOT NULL,
  flex_price_cbd_pln numeric(10,2) NOT NULL,
  flex_price_non_cbd_pln numeric(10,2) NOT NULL,
  fitout_contribution_cbd_eur numeric(10,2) NOT NULL,
  fitout_contribution_non_cbd_eur numeric(10,2) NOT NULL,
  fitout_cost_basic_eur numeric(10,2) NOT NULL,
  fitout_cost_enhanced_eur numeric(10,2) NOT NULL,
  fitout_cost_premium_eur numeric(10,2) NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE flex_calculator_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE flex_calculator_density_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE flex_calculator_market_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read flex calculator settings" ON flex_calculator_settings;
DROP POLICY IF EXISTS "Public read flex calculator density" ON flex_calculator_density_options;
DROP POLICY IF EXISTS "Public read flex calculator market data" ON flex_calculator_market_data;

CREATE POLICY "Public read flex calculator settings" ON flex_calculator_settings FOR SELECT USING (true);
CREATE POLICY "Public read flex calculator density" ON flex_calculator_density_options FOR SELECT USING (true);
CREATE POLICY "Public read flex calculator market data" ON flex_calculator_market_data FOR SELECT USING (false);

INSERT INTO flex_calculator_settings (
  id,
  intro_eyebrow,
  intro_title,
  intro_body,
  intro_disclaimer_approx,
  intro_disclaimer_market,
  intro_disclaimer_support,
  default_headcount,
  default_city_slug,
  default_location_type,
  default_fitout_standard,
  default_density_key,
  default_flex_lease_months,
  default_conventional_lease_months,
  utilities_and_maintenance_eur_per_sqm,
  flex_common_area_sqm_per_desk,
  add_on_factor,
  rent_free_months_per_year
)
VALUES (
  'default',
  'Kalkulator flex',
  'Porównaj flex z najmem konwencjonalnym na porównywalnych założeniach',
  'To narzędzie pomaga szybko oszacować różnice kosztowe między biurem serwisowanym a najmem konwencjonalnym dla Twojego zespołu. Największą wagę mają tu dwa wskaźniki: łączne zobowiązanie oraz koszt konwencji liczony za identyczny okres jak planowana umowa flex.',
  'Wartości w kalkulatorze mają charakter orientacyjny i służą do wstępnego oszacowania scenariuszy.',
  'Założenia opierają się na aktualnych danych rynkowych opracowywanych przez zespół Colliers, ale z natury rzeczy pozostają uśrednione.',
  'Jeśli będziesz szukać biura z udziałem Colliers, pomożemy przełożyć te estymacje na realne oferty, negocjacje i rekomendację najlepszego modelu.',
  150,
  'warszawa',
  'cbd',
  'enhanced',
  'spacious',
  12,
  60,
  5,
  0.9,
  1.06,
  1
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO flex_calculator_density_options (
  key,
  label,
  sort_order,
  flex_office_sqm_per_desk,
  conventional_sqm_per_person_avg,
  is_active
)
VALUES
  ('dense', 'Gęsto', 1, 3.5, 9, true),
  ('standard', 'Standard', 2, 4, 11, true),
  ('spacious', 'Swobodnie', 3, 4.5, 13.5, true)
ON CONFLICT (key) DO NOTHING;

INSERT INTO flex_calculator_market_data (
  city_slug,
  city_label,
  sort_order,
  is_active,
  headline_rent_cbd_eur,
  non_cbd_deduction_eur,
  service_charge_cbd_pln,
  service_charge_non_cbd_pln,
  flex_price_cbd_pln,
  flex_price_non_cbd_pln,
  fitout_contribution_cbd_eur,
  fitout_contribution_non_cbd_eur,
  fitout_cost_basic_eur,
  fitout_cost_enhanced_eur,
  fitout_cost_premium_eur
)
VALUES
  ('warszawa', 'Warszawa', 1, true, 26, -10, 33.4, 33.4, 2500, 1500, 600, 400, 1300, 1500, 1600),
  ('krakow', 'Kraków', 2, true, 20, -5, 27.3, 27.3, 1700, 1200, 400, 300, 500, 1050, 1950),
  ('poznan', 'Poznań', 3, true, 16, -6, 27.3, 27.3, 1300, 1100, 350, 200, 550, 900, 1450),
  ('wroclaw', 'Wrocław', 4, true, 15, -4, 27.3, 27.3, 1500, 1150, 300, 200, 550, 900, 1450),
  ('katowice', 'Katowice', 5, true, 14, -5, 27.3, 27.3, 1300, 1100, 300, 200, 550, 900, 1450),
  ('lodz', 'Łódź', 6, true, 12, -6, 27.3, 27.3, 1100, 1100, 300, 200, 550, 900, 1450),
  ('trojmiasto', 'Trójmiasto', 7, true, 15, -6, 27.3, 27.3, 1500, 1200, 400, 300, 760, 900, 1450)
ON CONFLICT (city_slug) DO NOTHING;
