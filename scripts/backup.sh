#!/bin/bash

# Personal Productivity Suite Backup Script

set -e

# Configuration
BACKUP_DIR=${BACKUP_DIR:-"./backups"}
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="productivity_suite_backup_$DATE"

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

# Create backup directory
mkdir -p $BACKUP_DIR

log_info "🔄 Starting backup process..."

# Backup environment configuration
log_info "Backing up environment configuration..."
if [ -f .env ]; then
    cp .env "$BACKUP_DIR/${BACKUP_NAME}_env"
    log_info "✅ Environment configuration backed up"
else
    log_warn "No .env file found to backup"
fi

# Backup Docker volumes (if any)
log_info "Backing up Docker volumes..."
if docker volume ls | grep -q productivity; then
    docker run --rm -v productivity_data:/data -v $PWD/$BACKUP_DIR:/backup alpine tar czf /backup/${BACKUP_NAME}_volumes.tar.gz -C /data .
    log_info "✅ Docker volumes backed up"
else
    log_info "No Docker volumes found to backup"
fi

# Backup SSL certificates (if using Traefik)
if [ -d "./letsencrypt" ]; then
    log_info "Backing up SSL certificates..."
    tar czf "$BACKUP_DIR/${BACKUP_NAME}_ssl.tar.gz" letsencrypt/
    log_info "✅ SSL certificates backed up"
fi

# Create backup manifest
log_info "Creating backup manifest..."
cat > "$BACKUP_DIR/${BACKUP_NAME}_manifest.txt" << EOF
Personal Productivity Suite Backup
Created: $(date)
Backup Name: $BACKUP_NAME

Files included:
- Environment configuration (.env)
- Docker volumes (if any)
- SSL certificates (if any)

Restore instructions:
1. Copy .env file back to project root
2. Extract volumes: docker run --rm -v productivity_data:/data -v \$PWD:/backup alpine tar xzf /backup/${BACKUP_NAME}_volumes.tar.gz -C /data
3. Extract SSL certificates: tar xzf ${BACKUP_NAME}_ssl.tar.gz
4. Restart services: docker-compose up -d
EOF

log_info "✅ Backup manifest created"

# Cleanup old backups (keep last 7 days)
log_info "Cleaning up old backups..."
find $BACKUP_DIR -name "productivity_suite_backup_*" -mtime +7 -delete 2>/dev/null || true
log_info "✅ Old backups cleaned up"

log_info "🎉 Backup completed successfully!"
log_info "Backup location: $BACKUP_DIR"
log_info "Backup files:"
ls -la $BACKUP_DIR/${BACKUP_NAME}_*
