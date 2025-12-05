#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# EMPIRE CONTROL CENTER - ONE-COMMAND DEPLOYMENT
# ═══════════════════════════════════════════════════════════════

set -e  # Exit on error

echo "🚀 Empire Control Center - Deployment Script"
echo "=============================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found!"
    echo "📝 Creating .env from .env.example..."
    cp .env.example .env
    echo "✅ Please edit .env file with your configuration and run this script again."
    exit 1
fi

# Check Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main || echo "⚠️  Git pull failed or not a git repo"
echo ""

# Build images
echo "🔨 Building Docker images..."
docker-compose build
echo "✅ Images built successfully"
echo ""

# Start services
echo "🚀 Starting services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check health
echo ""
echo "🏥 Service Health Check:"
echo "------------------------"
docker-compose ps

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Access Points:"
echo "  - GG Loop Platform: http://localhost:3000"
echo "  - Empire Hub Dashboard: http://localhost:8080"
echo "  - Grafana: http://localhost:3030 (admin/admin)"
echo "  - Prometheus: http://localhost:9090"
echo ""
echo "📊 View logs:"
echo "  docker-compose logs -f"
echo ""
echo "🛑 Stop all services:"
echo "  docker-compose down"
echo ""
