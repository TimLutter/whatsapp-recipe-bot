-- Seed channels
INSERT INTO channels (name, platform, wa_selector, frequency, windows) VALUES
  ('Airfryer Rezepte', 'whatsapp', 'Airfryer Rezepte', 3, '[
    {"start": "08:00", "end": "10:00"},
    {"start": "12:00", "end": "14:00"},
    {"start": "18:00", "end": "21:00"}
  ]'::jsonb),
  ('Thermomix Community', 'whatsapp', 'Thermomix Community', 2, '[
    {"start": "09:00", "end": "11:00"},
    {"start": "17:00", "end": "20:00"}
  ]'::jsonb),
  ('Schnelle Küche', 'whatsapp', 'Schnelle Küche', 4, '[
    {"start": "07:00", "end": "09:00"},
    {"start": "11:30", "end": "13:30"},
    {"start": "16:00", "end": "18:00"},
    {"start": "19:00", "end": "21:00"}
  ]'::jsonb);

-- Note: Recipes will be seeded using the pipeline CLI command
-- Run: pnpm --filter @whatsapp-recipe-bot/pipeline generate --count 5