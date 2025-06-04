#!/bin/bash

# Personal Productivity Suite Deployment Script

set -e

echo "🚀 Starting deployment of Personal Productivity Suite..."

# Configuration
DOMAIN=${DOMAIN:-"your-domain.com"}
EMAIL=${EMAIL:-"your-email@domain.com"}
COMPOSE_FILE=${COMPOSE_FILE:-"docker-compose.yml"}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    log_warn ".env file not found. Creating from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        log_info "Please edit .env file with your configuration before continuing."
        exit 1
    else
        log_error ".env.example file not found. Please create .env file manually."
        exit 1
    fi
fi

# Build and start services
log_info "Building Docker images..."
docker-compose -f $COMPOSE_FILE build

log_info "Starting services..."
docker-compose -f $COMPOSE_FILE up -d

# Wait for services to be healthy
log_info "Waiting for services to be ready..."
sleep 30

# Check if services are running
if docker-compose -f $COMPOSE_FILE ps | grep -q "Up"; then
    log_info "✅ Services are running successfully!"
    
    # Show running services
    echo ""
    log_info "Running services:"
    docker-compose -f $COMPOSE_FILE ps
    
    echo ""
    log_info "🎉 Deployment completed successfully!"
    log_info "Your application should be available at:"
    
    if [[ $COMPOSE_FILE == *"traefik"* ]]; then
        log_info "  - https://$DOMAIN"
        log_info "  - Traefik dashboard: https://traefik.$DOMAIN"
    else
        log_info "  - http://localhost:3000"
    fi
    
else
    log_error "❌ Some services failed to start. Check logs with:"
    log_error "docker-compose -f $COMPOSE_FILE logs"
    exit 1
fi

# Show logs
echo ""
log_info "Recent logs:"
docker-compose -f $COMPOSE_FILE logs --tail=20
