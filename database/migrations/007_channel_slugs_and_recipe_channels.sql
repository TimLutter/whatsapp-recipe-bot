-- Add slug column to channels for URL-friendly names
ALTER TABLE channels ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Create junction table for many-to-many relationship between recipes and channels
CREATE TABLE IF NOT EXISTS recipe_channels (
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (recipe_id, channel_id)
);

CREATE INDEX idx_recipe_channels_recipe_id ON recipe_channels(recipe_id);
CREATE INDEX idx_recipe_channels_channel_id ON recipe_channels(channel_id);

-- Enable RLS on recipe_channels
ALTER TABLE recipe_channels ENABLE ROW LEVEL SECURITY;

-- Public read access for recipe_channels
CREATE POLICY "recipe_channels_public_read" ON recipe_channels
  FOR SELECT
  USING (true);

-- Service role has full access
CREATE POLICY "recipe_channels_service_all" ON recipe_channels
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Update existing channels with slugs (URL-friendly versions)
UPDATE channels SET slug = 'airfryer-rezepte' WHERE name = 'Airfryer Rezepte' AND slug IS NULL;
UPDATE channels SET slug = 'thermomix-rezepte' WHERE name = 'Thermomix Rezepte' AND slug IS NULL;
UPDATE channels SET slug = '20-minuten-rezepte' WHERE name = '20 Minuten Rezepte' AND slug IS NULL;
UPDATE channels SET slug = '5-zutaten-rezepte' WHERE name = '5 Zutaten Rezepte' AND slug IS NULL;
UPDATE channels SET slug = 'gesund-einfach-schnell' WHERE name LIKE 'Gesund%' AND slug IS NULL;
UPDATE channels SET slug = 'high-protein-rezepte' WHERE name = 'High-Protein Rezepte' AND slug IS NULL;
UPDATE channels SET slug = 'resteverwertung' WHERE name LIKE 'Resteverwertung%' AND slug IS NULL;

-- Make slug NOT NULL after updating existing records
ALTER TABLE channels ALTER COLUMN slug SET NOT NULL;

-- Add index for slug lookups
CREATE INDEX idx_channels_slug ON channels(slug);
