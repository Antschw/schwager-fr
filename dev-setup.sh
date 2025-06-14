#!/bin/bash

# Schwager Plant Monitoring - Development Setup Script
# This script helps you set up the development environment quickly

set -e

echo "🌱 Setting up Schwager Plant Monitoring development environment..."

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

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

print_status "Checking Node.js version..."
NODE_VERSION=$(node --version)
print_success "Node.js version: $NODE_VERSION"

print_status "Checking Docker version..."
DOCKER_VERSION=$(docker --version)
print_success "Docker version: $DOCKER_VERSION"

# Setup backend
print_status "Setting up backend..."
cd backend

# Install backend dependencies
print_status "Installing backend dependencies..."
npm install

# Setup environment file
if [ ! -f .env ]; then
    print_status "Creating backend .env file..."
    cp .env.local .env
    print_success "Backend .env file created from .env.local"
else
    print_warning "Backend .env file already exists"
fi

# Start database
print_status "Starting PostgreSQL database with Docker..."
docker-compose up -d

# Wait for database to be ready
print_status "Waiting for database to be ready..."
sleep 5

# Generate Prisma client
print_status "Generating Prisma client..."
npx prisma generate

# Run database migrations
print_status "Running database migrations..."
npx prisma migrate dev --name init || print_warning "Migrations already applied or failed"

# Seed database (optional)
read -p "Do you want to seed the database with test data? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Seeding database..."
    npx prisma db seed || print_warning "Seeding failed or already done"
fi

cd ..

# Setup frontend
print_status "Setting up frontend..."
cd frontend

# Install frontend dependencies
print_status "Installing frontend dependencies..."
npm install

cd ..

# Final instructions
print_success "🎉 Development environment setup complete!"
echo
print_status "To start the development servers:"
echo -e "  ${YELLOW}Backend:${NC}  cd backend && npm run dev"
echo -e "  ${YELLOW}Frontend:${NC} cd frontend && npm run dev"
echo
print_status "URLs:"
echo -e "  ${YELLOW}Frontend:${NC}    http://localhost:3000"
echo -e "  ${YELLOW}Backend API:${NC}  http://localhost:4000"
echo -e "  ${YELLOW}API Docs:${NC}     http://localhost:4000/api-docs"
echo -e "  ${YELLOW}Prisma Studio:${NC} npx prisma studio (from backend directory)"
echo
print_status "Useful commands:"
echo -e "  ${YELLOW}View DB:${NC}      cd backend && npx prisma studio"
echo -e "  ${YELLOW}Reset DB:${NC}     cd backend && npx prisma migrate reset"
echo -e "  ${YELLOW}Stop DB:${NC}      cd backend && docker-compose down"
echo
print_success "Happy coding! 🚀"