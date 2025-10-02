FROM node:20-bullseye-slim

# Install Playwright dependencies
RUN apt-get update && apt-get install -y \
    wget \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcb-dri3-0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libxss1 \
    libxtst6 \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN npm install -g pnpm@8.15.0

WORKDIR /app

# Copy package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/core/package.json ./packages/core/
COPY packages/supabase/package.json ./packages/supabase/
COPY packages/whatsapp/package.json ./packages/whatsapp/
COPY packages/generation/package.json ./packages/generation/
COPY apps/api/package.json ./apps/api/
COPY apps/pipeline/package.json ./apps/pipeline/
COPY apps/poster/package.json ./apps/poster/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build all packages and apps
RUN pnpm build

# Install Playwright browsers (only Chromium)
RUN npx playwright install chromium

# Create data directory for WhatsApp session
RUN mkdir -p /data/wa_user

EXPOSE 8080

# Default to API service, can be overridden
CMD ["node", "apps/api/dist/index.js"]