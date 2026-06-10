#!/bin/bash

# =================================================
# Competitor Intelligence Dashboard - Setup Script
# =================================================

set -e

echo "================================================="
echo "  Competitor Intelligence Dashboard Setup"
echo "================================================="

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "Node.js is required but not installed. Aborting." >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "npm is required but not installed. Aborting." >&2; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "Docker is required but not installed. Aborting." >&2; exit 1; }

echo ""
echo "✅ Prerequisites check passed"

# Copy env file
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file (please configure API keys)"
else
    echo "ℹ️  .env file already exists"
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Start infrastructure
echo ""
echo "🐳 Starting Docker infrastructure (PostgreSQL + Redis)..."
docker compose -f docker-compose.dev.yml up -d

# Wait for Postgres
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Set up database
echo ""
echo "🗄️  Setting up database..."
cd packages/database
npm run db:generate
npm run db:push
npm run db:seed
cd ../..

echo ""
echo "================================================="
echo "  ✅ Setup Complete!"
echo "================================================="
echo ""
echo "  Start development:"
echo "    npm run dev"
echo ""
echo "  Services:"
echo "    Frontend:      http://localhost:3000"
echo "    API:           http://localhost:3001"
echo "    API Docs:      http://localhost:3001/api/docs"
echo "    pgAdmin:       http://localhost:5050"
echo "    Redis UI:      http://localhost:8081"
echo ""
echo "  Don't forget to add your API keys to .env:"
echo "    ANTHROPIC_API_KEY=..."
echo "    NEWSAPI_KEY=..."
echo "    SERPER_API_KEY=..."
echo "================================================="
