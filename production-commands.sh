#!/bin/bash

# Schwager Plant Monitoring - Production Management Script
# Useful commands for managing the production deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Show usage
show_usage() {
    echo "🌱 Schwager Plant Monitoring - Production Management"
    echo
    echo "Usage: $0 [command]"
    echo
    echo "Commands:"
    echo "  deploy      - Full deployment (pull + restart all services)"
    echo "  status      - Show services status"
    echo "  logs        - Show logs for all services"
    echo "  restart     - Restart all services"
    echo "  update      - Update images and restart"
    echo "  cleanup     - Clean up old images and containers"
    echo "  backup      - Backup uploads and database"
    echo "  health      - Run health checks"
    echo "  migrate     - Run database migrations"
    echo
    echo "Service-specific commands:"
    echo "  backend     - Manage backend service"
    echo "  frontend    - Manage frontend service"
    echo "  nginx       - Manage nginx service"
    echo
    exit 1
}

# Check if docker-compose.prod.yml exists
if [ ! -f docker-compose.prod.yml ]; then
    print_error "docker-compose.prod.yml not found. Make sure you're in the project root."
    exit 1
fi

# Full deployment
deploy() {
    print_status "Starting full deployment..."
    
    git pull origin main
    docker-compose -f docker-compose.prod.yml pull
    docker-compose -f docker-compose.prod.yml up -d
    
    print_success "Deployment completed!"
    health
}

# Show status
status() {
    print_status "Services status:"
    docker-compose -f docker-compose.prod.yml ps
}

# Show logs
logs() {
    if [ -n "$2" ]; then
        print_status "Showing logs for $2..."
        docker-compose -f docker-compose.prod.yml logs -f "$2"
    else
        print_status "Showing logs for all services..."
        docker-compose -f docker-compose.prod.yml logs -f
    fi
}

# Restart services
restart() {
    if [ -n "$2" ]; then
        print_status "Restarting $2..."
        docker-compose -f docker-compose.prod.yml restart "$2"
    else
        print_status "Restarting all services..."
        docker-compose -f docker-compose.prod.yml restart
    fi
}

# Update images
update() {
    print_status "Updating images..."
    docker-compose -f docker-compose.prod.yml pull
    docker-compose -f docker-compose.prod.yml up -d
    print_success "Update completed!"
}

# Cleanup
cleanup() {
    print_status "Cleaning up..."
    docker image prune -f
    docker container prune -f
    docker volume prune -f
    docker network prune -f
    print_success "Cleanup completed!"
}

# Backup
backup() {
    BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    print_status "Creating backup in $BACKUP_DIR..."
    
    # Backup uploads
    docker cp schwager-backend:/app/public/uploads "$BACKUP_DIR/uploads"
    
    # Backup database
    docker-compose -f docker-compose.prod.yml exec -T backend npx prisma db pull --schema="$BACKUP_DIR/schema.prisma"
    
    print_success "Backup completed in $BACKUP_DIR"
}

# Health checks
health() {
    print_status "Running health checks..."
    
    # Check backend
    if curl -f http://localhost:4000/api/auth/me > /dev/null 2>&1; then
        print_success "Backend is healthy"
    else
        print_error "Backend health check failed"
    fi
    
    # Check frontend
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        print_success "Frontend is healthy"
    else
        print_error "Frontend health check failed"
    fi
    
    # Check reverse proxy
    if curl -f http://localhost:80/health > /dev/null 2>&1; then
        print_success "Nginx proxy is healthy"
    else
        print_error "Nginx proxy health check failed"
    fi
}

# Database migrations
migrate() {
    print_status "Running database migrations..."
    docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
    print_success "Migrations completed!"
}

# Service management
manage_service() {
    service=$1
    action=${2:-status}
    
    case $action in
        "logs")
            logs "" "$service"
            ;;
        "restart")
            restart "" "$service"
            ;;
        "status")
            docker-compose -f docker-compose.prod.yml ps "$service"
            ;;
        *)
            print_error "Unknown action: $action"
            echo "Available actions: logs, restart, status"
            ;;
    esac
}

# Main command handler
case ${1:-help} in
    "deploy")
        deploy
        ;;
    "status")
        status
        ;;
    "logs")
        logs "$@"
        ;;
    "restart")
        restart "$@"
        ;;
    "update")
        update
        ;;
    "cleanup")
        cleanup
        ;;
    "backup")
        backup
        ;;
    "health")
        health
        ;;
    "migrate")
        migrate
        ;;
    "backend"|"frontend"|"nginx")
        manage_service "$1" "$2"
        ;;
    "help"|*)
        show_usage
        ;;
esac