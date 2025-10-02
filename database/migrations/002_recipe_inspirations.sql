-- Recipe Inspirations table
-- This table stores recipe titles and optional URLs for generating new recipes
CREATE TABLE recipe_inspirations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  reference_url TEXT, -- Optional URL to use as reference
  device TEXT,
  diet TEXT[] DEFAULT '{}',
  category TEXT[] DEFAULT '{}',
  lang TEXT NOT NULL DEFAULT 'de',
  status TEXT NOT NULL CHECK (status IN ('PENDING', 'GENERATING', 'COMPLETED', 'FAILED')) DEFAULT 'PENDING',
  generated_recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

CREATE INDEX idx_recipe_inspirations_status ON recipe_inspirations(status);
CREATE INDEX idx_recipe_inspirations_created_at ON recipe_inspirations(created_at DESC);
CREATE INDEX idx_recipe_inspirations_generated_recipe_id ON recipe_inspirations(generated_recipe_id);

-- Update timestamps trigger for recipe_inspirations
CREATE TRIGGER recipe_inspirations_updated_at
  BEFORE UPDATE ON recipe_inspirations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();