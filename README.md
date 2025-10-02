# WhatsApp Recipe Bot - FamFood Integration

A backend system that automates recipe posting to WhatsApp channels using browser automation. Content is generated, stored in Supabase, and posted with human-like behavior to avoid detection.

## ⚠️ Important Disclaimer

**WhatsApp Terms of Service**: This project uses browser automation (not official APIs) to post to WhatsApp channels. This approach:
- May violate WhatsApp's Terms of Service
- Could result in account suspension or bans
- Should be used at your own risk
- Is intended for personal/educational purposes only

**Mitigation strategies implemented:**
- Rate limiting (max posts per day, minimum gaps)
- Random delays and human-like typing
- Persistent sessions to avoid repeated logins
- Safe mode for testing without actually posting

## Features

- 🤖 **AI-Powered Recipe Generation**: Pluggable text and image generation (stub, OpenAI, etc.)
- 📱 **WhatsApp Automation**: Human-like posting with Playwright
- 📅 **Smart Scheduling**: Time windows, frequency control, random posting times
- 🎯 **Multi-Channel Support**: Manage multiple WhatsApp channels with different configurations
- 📊 **Rate Limiting**: Configurable limits to stay under the radar
- 🔒 **Persistent Sessions**: QR login once, reuse session
- 📈 **Monitoring**: Health checks, metrics, JSON logging
- 🐳 **Docker Ready**: Complete containerization with docker-compose

## Architecture

```
/apps
  /api         → REST API (recipes, health, metrics)
  /pipeline    → Content generation service
  /poster      → WhatsApp posting worker + scheduler

/packages
  /core        → Shared types, utilities
  /supabase    → Database client & repositories
  /whatsapp    → Browser automation layer
  /generation  → AI text/image/PDF generation

/database
  /migrations  → Supabase SQL schemas
```

## Prerequisites

- Node.js 20+
- pnpm 8+
- Supabase account
- (Optional) Docker & Docker Compose

## Quick Start

### 1. Clone and Install

```bash
git clone <repo>
cd whatsapp-recipe-channel
pnpm install
```

### 2. Configure Supabase

1. Create a Supabase project at https://supabase.com
2. Run the migration in `database/migrations/001_initial_schema.sql`
3. Create storage buckets: `images` and `pdfs` (both public read)
4. Run seed data from `database/seed.sql`

See [database/README.md](database/README.md) for details.

### 3. Environment Setup

```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

### 4. Build

```bash
pnpm build
```

### 5. Generate Test Recipes

```bash
pnpm --filter @whatsapp-recipe-bot/pipeline generate --count 5
```

### 6. WhatsApp QR Login

**Important**: Must be done before posting!

```bash
pnpm --filter @whatsapp-recipe-bot/poster qr-login
```

Scan the QR code with your WhatsApp mobile app. Session will be saved.

### 7. Start Services

**Development:**
```bash
# API only
pnpm --filter @whatsapp-recipe-bot/api dev

# All services
pnpm dev
```

**Production (Docker):**
```bash
docker-compose up -d
```

## Usage

### API Endpoints

- `GET /health` - Health check
- `GET /metrics` - Prometheus metrics
- `GET /recipes` - List recipes
- `GET /recipes/:slug` - Get recipe by slug

Example:
```bash
curl http://localhost:8080/recipes/airfryer-haehnchen-abc123
```

### CLI Commands

**Generate recipes:**
```bash
pnpm --filter @whatsapp-recipe-bot/pipeline generate --count 10
```

**QR login for WhatsApp:**
```bash
pnpm --filter @whatsapp-recipe-bot/poster qr-login
```

## Configuration

### Rate Limiting

- `POST_MIN_GAP_MINUTES`: Minimum minutes between posts (default: 45)
- `POST_MAX_PER_DAY`: Maximum posts per channel per day (default: 6)

### Humanization

- `HUMANIZE_TYPO_RATE`: Typo rate 0-1 (default: 0.02 = 2%)
- `HUMANIZE_MIN_DELAY_MS`: Min typing delay (default: 800ms)
- `HUMANIZE_MAX_DELAY_MS`: Max typing delay (default: 3500ms)

### Posting Windows

Configured in Supabase `channels` table:
```json
[
  {"start": "08:00", "end": "10:00"},
  {"start": "12:00", "end": "14:00"},
  {"start": "18:00", "end": "21:00"}
]
```

### Safe Mode

Set `SAFE_MODE=true` to run without actually posting (dry-run).

## How It Works

1. **Scheduler**: Checks enabled channels every 5 minutes
2. **Scheduling Logic**:
   - Respects daily frequency limits
   - Picks random recipes
   - Schedules posts in configured time windows with random delays
3. **Worker**: Every 30 seconds, checks for due posts
4. **Posting**:
   - Fetches recipe + media from Supabase
   - Downloads image temporarily
   - Opens WhatsApp in browser (Playwright)
   - Selects channel
   - Types caption with human-like behavior (typos, corrections, delays)
   - Attaches image
   - Sends message
5. **Retry Logic**: 3 attempts with backoff on failures

## Monitoring

- **Health**: `GET /health` - checks Supabase connectivity
- **Metrics**: `GET /metrics` - Prometheus-compatible metrics
- **Logs**: JSON logs to stdout (configure with `NODE_ENV=production`)

## Troubleshooting

### "QR code detected - manual scan required"

Run the QR login command:
```bash
pnpm --filter @whatsapp-recipe-bot/poster qr-login
```

### Posts not being created

1. Check that channels are enabled in Supabase
2. Verify time windows cover current time
3. Check daily limit hasn't been reached
4. Look at logs: `docker-compose logs poster`

### Session expired

Re-run QR login. Session data is stored in `/data/wa_user` (or Docker volume).

### WhatsApp channel not found

Update `wa_selector` in the `channels` table to match your channel name or ARIA label.

## Development

### Project Structure

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed architecture.

### Adding AI Providers

Implement interfaces in `packages/generation`:
- `TextGenerator` for recipe text
- `ImageGenerator` for recipe images

### Testing

```bash
pnpm test
```

## Deployment

See [docs/OPERATIONS.md](docs/OPERATIONS.md) for production deployment guide.

## Security Considerations

- Never commit `.env` files
- Use service role keys only in backend services
- Run in isolated environment (Docker)
- Monitor for rate limit violations
- Implement proper error alerting

## Roadmap

- [ ] Real AI integration (OpenAI, Anthropic)
- [ ] Advanced scheduling (ML-based optimal times)
- [ ] Multi-platform support (Telegram, Instagram)
- [ ] Admin web UI
- [ ] Analytics dashboard
- [ ] A/B testing for post content

## License

MIT

## Support

For issues, please check:
1. [Troubleshooting](#troubleshooting) section
2. [database/README.md](database/README.md) for Supabase setup
3. [docs/OPERATIONS.md](docs/OPERATIONS.md) for deployment help