# Getting Started with WhatsApp Recipe Bot

This is your step-by-step guide to get the bot running.

## ⚡ Quick Start (5 Steps)

### Step 1: Install Dependencies

```bash
# Make sure you have Node.js 20+ and pnpm
./scripts/setup.sh

# Or manually:
pnpm install
pnpm build
```

### Step 2: Configure Supabase

1. Go to https://supabase.com and create a new project
2. In SQL Editor, run this:

```sql
-- Copy/paste content from database/migrations/001_initial_schema.sql
```

3. Create storage buckets:
   - Go to Storage → Create bucket → `images` (Public)
   - Create bucket → `pdfs` (Public)

4. Copy your credentials to `.env`:

```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

5. Seed channels:

```sql
-- Copy/paste content from database/seed.sql
```

### Step 3: Generate Test Recipes

```bash
pnpm --filter @whatsapp-recipe-bot/pipeline generate --count 5
```

You should see:
```
✓ Recipe created: airfryer-haehnchen-abc123
✓ Image uploaded
✓ PDF uploaded
```

### Step 4: Login to WhatsApp

**Important**: This must be done with a visible browser!

```bash
pnpm --filter @whatsapp-recipe-bot/poster qr-login
```

A browser window will open. Scan the QR code with your WhatsApp mobile app (Settings → Linked Devices → Link a Device).

Once connected, the session is saved and you won't need to scan again.

### Step 5: Start Services

**Option A - Docker (Recommended):**
```bash
docker-compose up -d

# Check logs
docker-compose logs -f
```

**Option B - Development:**
```bash
# Terminal 1: API
pnpm --filter @whatsapp-recipe-bot/api dev

# Terminal 2: Poster
pnpm --filter @whatsapp-recipe-bot/poster dev
```

### Verify It's Working

```bash
# Check API health
curl http://localhost:8080/health

# List recipes
curl http://localhost:8080/recipes

# Get specific recipe
curl http://localhost:8080/recipes/airfryer-haehnchen-abc123
```

## 📋 Checklist

Before your first post, verify:

- [ ] Supabase configured (tables + storage buckets)
- [ ] At least 1 recipe in database with media
- [ ] At least 1 enabled channel in database
- [ ] WhatsApp session active (QR login successful)
- [ ] Environment variables set in `.env`
- [ ] Services running (check logs)

## 🧪 Test Without Posting (Safe Mode)

Add this to your `.env`:
```bash
SAFE_MODE=true
```

The system will schedule posts but NOT actually send them. Check logs to see what would be posted.

## 🎯 First Real Post

1. Make sure `SAFE_MODE=false` (or remove it)
2. Check your channel configuration in Supabase:

```sql
SELECT * FROM channels WHERE is_enabled = true;
```

3. Verify time windows include current time
4. Wait for the scheduler (runs every 5 minutes)
5. Watch the logs:

```bash
docker-compose logs -f poster
```

You should see:
```
[INFO] Post scheduled for channel XXX at 14:35:00
[INFO] Posting to channel...
[INFO] Message sent successfully
```

## ⚙️ Configuration

### Posting Frequency

Edit in Supabase → `channels` table:

- `frequency`: Number of posts per day (e.g., 3)
- `windows`: Time slots for posting:

```json
[
  {"start": "08:00", "end": "10:00"},
  {"start": "12:00", "end": "14:00"},
  {"start": "18:00", "end": "21:00"}
]
```

### Rate Limits

Edit in `.env`:

```bash
POST_MIN_GAP_MINUTES=45    # Minimum 45 min between posts
POST_MAX_PER_DAY=6         # Maximum 6 posts per channel
```

### Humanization

```bash
HUMANIZE_TYPO_RATE=0.02         # 2% typo rate
HUMANIZE_MIN_DELAY_MS=800       # Min typing delay
HUMANIZE_MAX_DELAY_MS=3500      # Max typing delay
```

## 🔍 Monitoring

### Check Scheduled Posts

```sql
SELECT
  p.id,
  c.name as channel,
  r.title as recipe,
  p.status,
  p.scheduled_for,
  p.retries
FROM posts p
JOIN channels c ON c.id = p.channel_id
JOIN recipes r ON r.id = p.recipe_id
ORDER BY p.scheduled_for DESC
LIMIT 10;
```

### Check Post History

```sql
SELECT
  c.name as channel,
  COUNT(*) as total_posts,
  COUNT(*) FILTER (WHERE p.status = 'POSTED') as successful,
  COUNT(*) FILTER (WHERE p.status = 'FAILED') as failed
FROM posts p
JOIN channels c ON c.id = p.channel_id
GROUP BY c.name;
```

## 🐛 Troubleshooting

### "No recipes available"

Generate some recipes:
```bash
pnpm --filter @whatsapp-recipe-bot/pipeline generate --count 10
```

### "QR code detected - manual scan required"

Your session expired. Re-run:
```bash
pnpm --filter @whatsapp-recipe-bot/poster qr-login
```

### "Channel not found"

Update `wa_selector` in the `channels` table to match your WhatsApp channel name exactly.

### Posts not being scheduled

1. Check channel is enabled: `is_enabled = true`
2. Check time windows include current time
3. Check daily limit not reached
4. Check logs: `docker-compose logs poster`

### Posts scheduled but not sent

1. Check WhatsApp session is active
2. Verify channel selector is correct
3. Check for errors in logs
4. Try with `SAFE_MODE=true` to see scheduling without sending

## 📚 Next Steps

- Read [README.md](README.md) for detailed information
- Read [ARCHITECTURE.md](docs/ARCHITECTURE.md) to understand the system
- Read [OPERATIONS.md](docs/OPERATIONS.md) for production deployment
- Customize recipe generation (add real AI providers)
- Set up monitoring with Prometheus + Grafana

## 🆘 Need Help?

1. Check the logs: `docker-compose logs -f`
2. Verify Supabase connection: `curl http://localhost:8080/health`
3. Review [README.md](README.md) troubleshooting section
4. Check database state with SQL queries above

## 🎉 Success!

Once you see your first message posted to WhatsApp, you're all set! The bot will:
- Automatically schedule posts in configured time windows
- Post with human-like behavior (delays, typos)
- Respect rate limits
- Retry on failures
- Track everything in the database

**Enjoy your automated recipe channel! 🍳**