-- Add 7 themed WhatsApp channels
-- These channels target specific recipe niches

INSERT INTO channels (name, platform, frequency, windows, is_enabled) VALUES
  -- 1. Airfryer Rezepte
  (
    'Airfryer Rezepte',
    'whatsapp',
    3,
    '[{"start": "08:00", "end": "22:00"}]'::jsonb,
    true
  ),

  -- 2. Thermomix Rezepte
  (
    'Thermomix Rezepte',
    'whatsapp',
    3,
    '[{"start": "08:00", "end": "22:00"}]'::jsonb,
    true
  ),

  -- 3. Schnelle Küche
  (
    'Schnelle Küche',
    'whatsapp',
    3,
    '[{"start": "08:00", "end": "22:00"}]'::jsonb,
    true
  ),

  -- 4. 5 Zutaten oder weniger
  (
    '5 Zutaten Rezepte',
    'whatsapp',
    3,
    '[{"start": "08:00", "end": "22:00"}]'::jsonb,
    true
  ),

  -- 5. Resteverwertung
  (
    'Resteverwertung',
    'whatsapp',
    3,
    '[{"start": "08:00", "end": "22:00"}]'::jsonb,
    true
  ),

  -- 6. High-Protein
  (
    'High-Protein Rezepte',
    'whatsapp',
    3,
    '[{"start": "08:00", "end": "22:00"}]'::jsonb,
    true
  ),

  -- 7. Gesund Einfach Schnell
  (
    'Gesund Einfach Schnell',
    'whatsapp',
    3,
    '[{"start": "08:00", "end": "22:00"}]'::jsonb,
    true
  );
