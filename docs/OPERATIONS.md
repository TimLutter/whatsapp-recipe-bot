# Operations Guide

## Production Deployment

### Prerequisites

- Docker and Docker Compose installed
- Supabase project configured
- Domain for recipe subdomain (e.g., `rezepte.famfood.app`)

### Step 1: Server Setup

```bash
# SSH into your server
ssh user@your-server.com

# Clone repository
git clone <repo-url>
cd whatsapp-recipe-channel

# Create .env file
cp .env.example .env
nano .env  # Edit with production values
```

### Step 2: Configure Environment

```bash
NODE_ENV=production
TZ=Europe/Berlin

# Supabase (from your Supabase project)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# AI Providers
TEXT_AI_PROVIDER=stub  # or openai, anthropic
IMAGE_AI_PROVIDER=stub

# WhatsApp
PLAYWRIGHT_HEADLESS=true
PLAYWRIGHT_USER_DATA_DIR=/data/wa_user

# Rate Limits
POST_MIN_GAP_MINUTES=45
POST_MAX_PER_DAY=6

# Subdomain
RECIPE_BASE_URL=https://rezepte.famfood.app

# Safety
SAFE_MODE=false  # Set to true for testing
```

### Step 3: Initialize Database

Follow [database/README.md](../database/README.md) to:
1. Run migrations
2. Create storage buckets
3. Configure policies
4. Seed channels

### Step 4: Generate Initial Recipes

```bash
# Build services
docker-compose build

# Generate recipes
docker-compose run --rm pipeline node apps/pipeline/dist/cli.js generate --count 10
```

### Step 5: WhatsApp QR Login

**Important**: Must be done with a visible browser!

Option A - Local QR login, then deploy:
```bash
# Run locally with visible browser
pnpm install
pnpm build
pnpm --filter @whatsapp-recipe-bot/poster qr-login

# Copy session data to server
scp -r ./data/wa_user user@server:/path/to/whatsapp-recipe-channel/data/
```

Option B - Remote QR login with X11/VNC:
```bash
# On server with X11 forwarding
docker-compose run --rm \
  -e PLAYWRIGHT_HEADLESS=false \
  poster node apps/poster/dist/cli.js qr-login
```

### Step 6: Start Services

```bash
docker-compose up -d
```

### Step 7: Verify

```bash
# Check logs
docker-compose logs -f

# Check API
curl http://localhost:8080/health

# Check metrics
curl http://localhost:8080/metrics

# List recipes
curl http://localhost:8080/recipes
```

## Monitoring

### Health Checks

```bash
# API health
curl http://localhost:8080/health

# Container status
docker-compose ps
```

### Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f poster

# Last 100 lines
docker-compose logs --tail=100 poster
```

### Metrics

Prometheus-compatible metrics at `/metrics`:
- `api_health`
- `api_uptime_seconds`
- `nodejs_memory_usage_bytes`

To scrape with Prometheus:
```yaml
scrape_configs:
  - job_name: 'recipe-bot'
    static_configs:
      - targets: ['your-server:8080']
```

## Maintenance

### Updating Code

```bash
git pull
docker-compose build
docker-compose up -d
```

### Backup WhatsApp Session

```bash
# Create backup
docker run --rm -v whatsapp-recipe-channel_wa_data:/data -v $(pwd):/backup alpine tar czf /backup/wa_session_backup.tar.gz /data

# Restore backup
docker run --rm -v whatsapp-recipe-channel_wa_data:/data -v $(pwd):/backup alpine tar xzf /backup/wa_session_backup.tar.gz -C /
```

### Rotate Logs

Docker manages log rotation by default. Configure in `docker-compose.yml`:

```yaml
services:
  api:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### Database Backups

Supabase provides automatic backups. For manual backup:

```bash
# Use Supabase CLI or dashboard
supabase db dump -f backup.sql
```

## Troubleshooting

### Service Won't Start

```bash
# Check logs
docker-compose logs <service>

# Check env vars
docker-compose config

# Rebuild
docker-compose build --no-cache <service>
```

### WhatsApp Session Lost

Re-run QR login (see Step 5).

### Posts Not Being Sent

1. Check poster logs: `docker-compose logs poster`
2. Verify channels are enabled in Supabase
3. Check time windows include current time
4. Verify daily limit not reached
5. Check recipes exist and have media
6. Try safe mode to see if posts are being scheduled

### Rate Limiting Issues

If you're getting blocked:
1. Increase `POST_MIN_GAP_MINUTES` (e.g., to 60+)
2. Decrease `POST_MAX_PER_DAY` (e.g., to 3-4)
3. Add more randomization to time windows
4. Pause posting for 24-48 hours

### High Memory Usage

```bash
# Check memory
docker stats

# Restart services
docker-compose restart

# Limit memory in docker-compose.yml
services:
  poster:
    mem_limit: 1g
```

## Scaling

### Horizontal Scaling

Current limitation: Poster uses local state (browser session).

For multiple instances:
1. Use distributed task queue (BullMQ with Redis)
2. Implement distributed locks
3. Share session storage (network volume)

### Vertical Scaling

Increase resources in `docker-compose.yml`:

```yaml
services:
  poster:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

## Security Best Practices

1. **Never expose ports publicly** - Use reverse proxy (nginx, Caddy)
2. **Use firewall** - Only allow necessary ports
3. **Rotate keys regularly** - Update Supabase keys, regenerate sessions
4. **Monitor logs** - Watch for suspicious activity
5. **Use HTTPS** - Ensure recipe subdomain uses SSL
6. **Limit access** - Use VPN or IP whitelist for management

## Alerting (Optional)

### Setup with Grafana + Prometheus

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'recipe-bot'
    static_configs:
      - targets: ['api:8080']

# Alert rules
groups:
  - name: recipe-bot
    rules:
      - alert: APIDown
        expr: up{job="recipe-bot"} == 0
        for: 5m
      - alert: HighFailureRate
        expr: rate(posts_failed[5m]) > 0.5
        for: 10m
```

### Webhook Alerts (e.g., Discord, Slack)

Implement custom alerting by monitoring logs:

```bash
# Example: Alert on FAILED posts
docker-compose logs -f poster | grep 'FAILED' | while read line; do
  curl -X POST <webhook-url> -d "{\"text\": \"$line\"}"
done
```

## Performance Optimization

### Database
- Index frequently queried fields (already done in migration)
- Vacuum regularly (Supabase handles this)
- Monitor slow queries

### Storage
- Use CDN for media (Cloudflare, etc.)
- Compress images before upload
- Set cache headers

### Application
- Enable Node.js cluster mode
- Use PM2 for process management
- Implement caching for frequently accessed recipes

## Backup Strategy

### What to Back Up
1. ✅ Supabase database (automatic with Supabase)
2. ✅ WhatsApp session data (manual)
3. ✅ Environment configuration (git + secrets manager)
4. ❌ Docker images (can rebuild)

### Backup Schedule
- Daily: WhatsApp session
- Weekly: Full database export
- Monthly: Test restore procedure

## Disaster Recovery

### Scenario: WhatsApp Account Banned

1. Stop poster service immediately
2. Create new WhatsApp account
3. Re-run QR login with new account
4. Reduce posting frequency
5. Gradually increase over 1-2 weeks

### Scenario: Database Corruption

1. Stop all services
2. Restore from Supabase backup
3. Re-run migrations if needed
4. Restart services
5. Verify data integrity

### Scenario: Server Failure

1. Provision new server
2. Clone repository
3. Restore environment variables
4. Restore WhatsApp session
5. Run docker-compose up
6. Verify health checks

## Cost Optimization

### Supabase
- Use appropriate tier (free tier sufficient for small scale)
- Monitor storage usage
- Set up retention policies for old posts

### Server
- Use spot instances if available
- Shutdown during low-activity hours (if manual posting acceptable)
- Optimize Docker images (multi-stage builds)

### AI Providers
- Use stub generators for testing
- Implement request caching
- Batch generation requests

## Compliance

### Data Privacy
- Recipe data is public (no PII)
- WhatsApp session stored locally (encrypted by Playwright)
- Logs may contain recipe titles (sanitize if needed)

### Terms of Service
- ⚠️ Using WhatsApp automation may violate ToS
- Use at your own risk
- Consider official WhatsApp Business API for production