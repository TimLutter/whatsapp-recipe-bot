# Database Setup

## Supabase Configuration

### 1. Create a new Supabase project

Go to https://supabase.com and create a new project.

### 2. Run migrations

In the Supabase SQL Editor, run the migration file:

```sql
-- Copy and paste the content of migrations/001_initial_schema.sql
```

### 3. Create storage buckets

In Supabase Dashboard → Storage, create two buckets:

- **images** (public)
- **pdfs** (public)

Set both buckets to allow public access for reads:

```sql
-- In SQL Editor
CREATE POLICY "Public read access for images"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

CREATE POLICY "Public read access for pdfs"
ON storage.objects FOR SELECT
USING (bucket_id = 'pdfs');

CREATE POLICY "Authenticated insert for images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'images' AND auth.role() = 'service_role');

CREATE POLICY "Authenticated insert for pdfs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'pdfs' AND auth.role() = 'service_role');
```

### 4. Seed initial data

Run the seed file in the SQL Editor:

```sql
-- Copy and paste the content of seed.sql
```

### 5. Configure environment variables

Copy the Supabase URL and keys to your `.env` file:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 6. Generate recipes

Use the pipeline CLI to generate initial recipes:

```bash
pnpm --filter @whatsapp-recipe-bot/pipeline generate --count 5
```

## Schema Overview

- **channels**: WhatsApp channels configuration
- **recipes**: Recipe content and metadata
- **media**: Links to images and PDFs in Supabase storage
- **posts**: Scheduled and posted content tracking