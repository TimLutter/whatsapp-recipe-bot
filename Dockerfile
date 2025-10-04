# Multi-stage build for production API deployment
FROM node:20-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@8.15.0

WORKDIR /app

# Copy package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/core/package.json ./packages/core/
COPY packages/supabase/package.json ./packages/supabase/
COPY packages/generation/package.json ./packages/generation/
COPY apps/api/package.json ./apps/api/

# Skip Puppeteer/Playwright installation
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code (only needed packages for API)
COPY packages/core ./packages/core
COPY packages/supabase ./packages/supabase
COPY packages/generation ./packages/generation
COPY apps/api ./apps/api
COPY tsconfig.json ./

# Build only required packages for API
RUN pnpm --filter @whatsapp-recipe/core build && \
    pnpm --filter @whatsapp-recipe/supabase build && \
    pnpm --filter @whatsapp-recipe/generation build && \
    pnpm --filter @whatsapp-recipe/api build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built artifacts and dependencies
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages/core/dist ./packages/core/dist
COPY --from=builder /app/packages/supabase/dist ./packages/supabase/dist
COPY --from=builder /app/packages/generation/dist ./packages/generation/dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Copy public files for static serving
COPY public ./public

EXPOSE 8080

# Start API server
CMD ["node", "apps/api/dist/index.js"]