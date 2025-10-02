#!/bin/bash
set -e

echo "🤖 WhatsApp Recipe Bot - Setup Script"
echo "======================================"

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 20+."
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm not found. Installing pnpm..."
    npm install -g pnpm@8.15.0
fi

echo "✅ Prerequisites OK"

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚙️  Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env with your Supabase credentials!"
    echo "   - SUPABASE_URL"
    echo "   - SUPABASE_ANON_KEY"
    echo "   - SUPABASE_SERVICE_ROLE_KEY"
    read -p "Press enter when you've configured .env..."
fi

# Build packages
echo "🔨 Building packages..."
pnpm build

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure Supabase (see database/README.md)"
echo "2. Run migrations in Supabase SQL Editor"
echo "3. Create storage buckets (images, pdfs)"
echo "4. Generate test recipes: pnpm --filter @whatsapp-recipe-bot/pipeline generate --count 5"
echo "5. Run QR login: pnpm --filter @whatsapp-recipe-bot/poster qr-login"
echo "6. Start services: docker-compose up -d"
echo ""
echo "For development:"
echo "  - API: pnpm --filter @whatsapp-recipe-bot/api dev"
echo "  - Pipeline: pnpm --filter @whatsapp-recipe-bot/pipeline dev"
echo "  - Poster: pnpm --filter @whatsapp-recipe-bot/poster dev"
echo ""