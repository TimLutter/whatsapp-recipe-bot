-- Enable Row Level Security (RLS) on all tables
-- This ensures data is protected by default

-- Enable RLS
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_inspirations ENABLE ROW LEVEL SECURITY;

-- Channels: Public read access, no write access
CREATE POLICY "channels_public_read" ON channels
  FOR SELECT
  USING (true);

CREATE POLICY "channels_service_all" ON channels
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Recipes: Public read access, no write access
CREATE POLICY "recipes_public_read" ON recipes
  FOR SELECT
  USING (true);

CREATE POLICY "recipes_service_all" ON recipes
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Media: Public read access, no write access
CREATE POLICY "media_public_read" ON media
  FOR SELECT
  USING (true);

CREATE POLICY "media_service_all" ON media
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Posts: No public access at all (internal only)
CREATE POLICY "posts_service_all" ON posts
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Recipe Inspirations: No public access at all (internal only)
CREATE POLICY "recipe_inspirations_service_all" ON recipe_inspirations
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');
