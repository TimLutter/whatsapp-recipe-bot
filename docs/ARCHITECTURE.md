# Architecture Documentation

## System Overview

The WhatsApp Recipe Bot is a microservices-based system built as a TypeScript monorepo using pnpm workspaces.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Supabase                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  PostgreSQL  │  │   Storage    │  │     Auth     │  │
│  │  (Recipes,   │  │  (Images,    │  │              │  │
│  │   Channels,  │  │   PDFs)      │  │              │  │
│  │   Posts)     │  │              │  │              │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
           ▲                ▲                ▲
           │                │                │
           ├────────────────┴────────────────┤
           │                                 │
┌──────────┴──────────┐         ┌───────────┴──────────┐
│   API Service       │         │  Pipeline Service    │
│  - REST endpoints   │         │  - Recipe generation │
│  - Health checks    │         │  - Image generation  │
│  - Metrics          │         │  - PDF generation    │
└─────────────────────┘         └──────────────────────┘

           ┌─────────────────────────────────┐
           │     Poster Service              │
           │  ┌────────────┐  ┌────────────┐ │
           │  │ Scheduler  │  │   Worker   │ │
           │  │ (cron)     │  │ (posts)    │ │
           │  └────────────┘  └────────────┘ │
           └─────────────────────────────────┘
                      │
                      ▼
           ┌─────────────────────┐
           │  WhatsApp Web       │
           │  (via Playwright)   │
           └─────────────────────┘
```

## Services

### 1. API Service (`apps/api`)

**Purpose**: Public-facing REST API for recipe retrieval and system monitoring.

**Responsibilities**:
- Serve recipe data by slug
- Health checks
- Prometheus metrics
- CORS handling

**Tech Stack**:
- Express.js
- TypeScript
- Supabase client

**Endpoints**:
- `GET /health` - System health status
- `GET /metrics` - Prometheus metrics
- `GET /recipes/:slug` - Recipe details with media
- `GET /recipes` - List recipes (paginated)

### 2. Pipeline Service (`apps/pipeline`)

**Purpose**: Content generation and preparation.

**Responsibilities**:
- Generate recipe text (AI or stub)
- Generate recipe images (AI or stub)
- Create PDF versions
- Upload media to Supabase storage
- Save recipes to database

**Tech Stack**:
- Pluggable AI providers (stub, OpenAI, etc.)
- Puppeteer for PDF generation
- Supabase client

**CLI**:
```bash
pnpm --filter @whatsapp-recipe-bot/pipeline generate --count N
```

### 3. Poster Service (`apps/poster`)

**Purpose**: Automated posting to WhatsApp channels.

**Responsibilities**:
- Schedule posts based on channel configuration
- Execute posts with human-like behavior
- Retry failed posts
- Track posting history
- Rate limiting

**Components**:

#### Scheduler
- Runs every 5 minutes
- Checks enabled channels
- Respects daily limits and time windows
- Creates scheduled posts

#### Worker
- Polls every 30 seconds for due posts
- Fetches recipe and media
- Opens WhatsApp in browser
- Executes post with humanization
- Updates post status
- Handles retries (max 3)

**Tech Stack**:
- Playwright for browser automation
- node-cron for scheduling
- Supabase client

## Shared Packages

### `packages/core`

Common types, interfaces, and utilities.

**Key exports**:
- Types: `Recipe`, `Channel`, `Post`, `Media`
- Utils: `slugify()`, `generateHashtags()`, `randomDelay()`, `createLogger()`

### `packages/supabase`

Database client and repositories.

**Key exports**:
- `initSupabase()`, `getSupabase()`
- `RecipesRepository`
- `ChannelsRepository`
- `PostsRepository`
- `MediaRepository`

**Pattern**: Repository pattern for data access abstraction.

### `packages/whatsapp`

WhatsApp Web automation layer.

**Key exports**:
- `launchBrowser()`, `getPage()`, `closeBrowser()`
- `ensureSession()`, `waitForLogin()`
- `selectChannel()`, `sendImageWithCaption()`
- `typeHuman()` - human-like typing with typos
- `postToChannel()` - main posting function

**Humanization Features**:
- Random typing delays
- Typo simulation with backspace correction
- Random posting times within windows
- Minimum gaps between posts

### `packages/generation`

Content generation abstraction.

**Key exports**:
- `createTextGenerator(provider)` - factory for text AI
- `createImageGenerator(provider)` - factory for image AI
- `generateRecipePdf()` - PDF creation with QR codes

**Providers**:
- `stub` - placeholder implementation
- `openai` - (to implement)
- `anthropic` - (to implement)

## Data Flow

### Recipe Generation Flow

```
1. CLI Command
   ↓
2. RecipeGenerator.generate()
   ↓
3. TextGenerator.generate() → Recipe data
   ↓
4. Save recipe to Supabase
   ↓
5. ImageGenerator.generate() → Image buffer
   ↓
6. Upload image to Supabase storage
   ↓
7. generateRecipePdf() → PDF buffer
   ↓
8. Upload PDF to Supabase storage
   ↓
9. Create media records
```

### Posting Flow

```
1. Scheduler (every 5 min)
   ↓
2. Check enabled channels
   ↓
3. For each channel:
   - Check daily limit
   - Check available time window
   - Select random recipe
   - Create scheduled post

4. Worker (every 30 sec)
   ↓
5. Find due posts
   ↓
6. For each due post:
   - Fetch recipe + media
   - Download image
   - Open WhatsApp
   - Navigate to channel
   - Type caption (with humanization)
   - Attach image
   - Send
   - Update status
```

## Database Schema

### Tables

**channels**
- Configuration for WhatsApp channels
- Posting frequency and time windows
- Enable/disable flag

**recipes**
- Recipe content (title, ingredients, steps)
- Device type, diet tags
- Slug for URL generation

**media**
- Links to images and PDFs in storage
- Foreign key to recipes

**posts**
- Scheduling and tracking
- Status: SCHEDULED → POSTING → POSTED/FAILED
- Retry count and error messages

### Relationships

```
channels 1---* posts *---1 recipes 1---* media
```

## Security

### Authentication
- Uses Supabase service role key (server-side only)
- No public authentication required

### Storage
- Public buckets for images/PDFs
- Service role for uploads
- Public read access for recipes

### Environment Variables
- Never commit `.env`
- Use `.env.example` as template
- Separate keys for development/production

## Scalability Considerations

### Current Limitations
- Single worker per channel
- In-memory scheduling (no distributed lock)
- Browser sessions are stateful

### Future Improvements
- Distributed task queue (BullMQ, Temporal)
- Multi-worker support with locks
- Session pooling for parallel posting
- Separate scheduler and worker processes

## Monitoring

### Logs
- JSON format in production
- Human-readable in development
- Structured with context (service, module, etc.)

### Metrics
- Prometheus-compatible endpoint
- Custom metrics for posts, errors, etc.
- Health checks for Supabase connectivity

### Alerts (to implement)
- Failed posts threshold
- Rate limit warnings
- Session expiration
- API downtime

## Testing Strategy

### Unit Tests
- Utilities (slugify, hashtags, delays)
- Repositories (with mocked Supabase)
- Generators (with stubs)

### Integration Tests
- Post composer with mock WhatsApp
- Recipe generation end-to-end
- API endpoints

### Smoke Tests
- Dry-run posting (safe mode)
- Health checks
- Database connectivity

## Deployment

See [OPERATIONS.md](OPERATIONS.md) for production deployment guide.