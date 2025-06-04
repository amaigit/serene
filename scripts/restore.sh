#!/bin/bash

# Personal Productivity Suite Restore Script

set -e

# Configuration
BACKUP_DIR=${BACKUP_DIR:-"./backups"}

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

# Check if backup name is provided
if [ -z "$1" ]; then
    log_error "Please provide backup name as argument"
    log_info "Available backups:"
    ls -la $BACKUP_DIR/productivity_suite_backup_* 2>/dev/null | grep -o 'productivity_suite_backup_[0-9_]*' | sort -u || log_warn "No backups found"
    exit 1
fi

BACKUP_NAME=$1

log_info "🔄 Starting restore process for backup: $BACKUP_NAME"

# Check if backup exists
if [ ! -f "$BACKUP_DIR/${BACKUP_NAME}_manifest.txt" ]; then
    log_error "Backup manifest not found: $BACKUP_DIR/${BACKUP_NAME}_manifest.txt"
    exit 1
fi

# Show backup manifest
log_info "Backup manifest:"
cat "$BACKUP_DIR/${BACKUP_NAME}_manifest.txt"

# Confirm restore
echo ""
read -p "Do you want to continue with the restore? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_info "Restore cancelled"
    exit 0
fi

# Stop services
log_info "Stopping services..."
docker-compose down 2>/dev/null || true

# Restore environment configuration
if [ -f "$BACKUP_DIR/${BACKUP_NAME}_env" ]; then
    log_info "Restoring environment configuration..."
    cp "$BACKUP_DIR/${BACKUP_NAME}_env" .env
    log_info "✅ Environment configuration restored"
fi

# Restore Docker volumes
if [ -f "$BACKUP_DIR/${BACKUP_NAME}_volumes.tar.gz" ]; then
    log_info "Restoring Docker volumes..."
    docker volume create productivity_data 2>/dev/null || true
    docker run --rm -v productivity_data:/data -v $PWD/$BACKUP_DIR:/backup alpine tar xzf /backup/${BACKUP_NAME}_volumes.tar.gz -C /data
    log_info "✅ Docker volumes restored"
fi

# Restore SSL certificates
if [ -f "$BACKUP_DIR/${BACKUP_NAME}_ssl.tar.gz" ]; then
    log_info "Restoring SSL certificates..."
    tar xzf "$BACKUP_DIR/${BACKUP_NAME}_ssl.tar.gz"
    log_info "✅ SSL certificates restored"
fi

# Start services
log_info "Starting services..."
docker-compose up -d

# Wait for services to be ready
log_info "Waiting for services to be ready..."
sleep 30

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    log_info "🎉 Restore completed successfully!"
    log_info "Services are running:"
    docker-compose ps
else
    log_error "❌ Some services failed to start after restore. Check logs with:"
    log_error "docker-compose logs"
    exit 1
fi
