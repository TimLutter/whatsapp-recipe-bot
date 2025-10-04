-- Add fun fact field to recipes table
ALTER TABLE recipes
  ADD COLUMN IF NOT EXISTS fun_fact TEXT;
