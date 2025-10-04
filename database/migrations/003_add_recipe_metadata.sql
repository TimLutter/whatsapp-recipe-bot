-- Add cooking time, difficulty, and allergens to recipes table
ALTER TABLE recipes 
  ADD COLUMN IF NOT EXISTS cooking_time INTEGER,
  ADD COLUMN IF NOT EXISTS difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  ADD COLUMN IF NOT EXISTS allergens TEXT[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_recipes_difficulty ON recipes(difficulty);
CREATE INDEX IF NOT EXISTS idx_recipes_cooking_time ON recipes(cooking_time);
