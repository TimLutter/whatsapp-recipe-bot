-- ============================================
-- Generic Supabase schema template
-- ============================================

-- Example users table
-- CREATE TABLE users (
--   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   email text UNIQUE NOT NULL,
--   created_at timestamptz DEFAULT now()
-- );

-- Example todos table
-- CREATE TABLE todos (
--   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   user_id uuid REFERENCES users (id),
--   task text NOT NULL,
--   completed boolean DEFAULT false,
--   created_at timestamptz DEFAULT now()
-- );

-- Add new tables, indexes, or functions here.