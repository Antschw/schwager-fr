# Auth API

Complete authentication and user management API built with Express, TypeScript, Prisma, and JWT tokens.

## Features

- **JWT Authentication** with access & refresh tokens
- **Role-based Access Control** (ADMIN, APP1_USER, APP2_USER, USER)
- **Secure Cookie Authentication** with HttpOnly cookies
- **Password Hashing** with Argon2
- **Input Validation** with Zod schemas
- **API Documentation** with Swagger UI
- **PostgreSQL Database** with Prisma ORM
- **TypeScript** for type safety

## Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- npm or yarn

### 1. Installation

```bash
# Clone the repository
git clone <your-repo>
cd auth-api

# Install dependencies
npm install
```

### 2. Database Setup

```bash
# Start PostgreSQL with Docker
docker-compose up -d

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed the database with admin user
npm run prisma:seed
```

### 4. Start Development Server

```bash
npm run dev
```

The API will be available at: **http://localhost:4000**

## API Documentation

### Swagger UI

Access the interactive API documentation at:
**http://localhost:4000/auth-api-docs**

### Quick Test Sequence

1. **Health Check**: `GET /auth-api/healthcheck`
2. **Login**: `POST /auth-api/auth/login` with:
3. **Get Profile**: `GET /auth-api/auth/me`
4. **Create User**: `POST /auth-api/users` (Admin only)
5. **Logout**: `POST /auth-api/auth/logout`

## Available Scripts

```bash
# Development
npm run dev              # Start development server with hot reload

# Database
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:seed      # Seed database with admin user

# Production
npm run build            # Build TypeScript to JavaScript
npm start                # Start production server
npm run start:prod       # Start with production environment
```

## Database Management

### Migrations

```bash
# Create a new migration
npx prisma migrate dev --name your_migration_name

# Deploy migrations to production
npx prisma migrate deploy

# Reset database (⚠️ DANGER: Deletes all data)
npx prisma migrate reset
```

### Database Access

```bash
# Open Prisma Studio (GUI)
npx prisma studio

# Direct PostgreSQL access
docker exec -it auth_db psql -U user -d auth_db
```

## Environment Configuration

### Development (.env.local)

- **Database**: Docker PostgreSQL
- **JWT Expiration**: 15m access, 7d refresh
- **CORS**: http://localhost:3000
- **Cookies**: Not secure (HTTP allowed)

### Production (.env.production)

- **Database**: VPS PostgreSQL with SSL
- **JWT Expiration**: 5m access, 1d refresh
- **CORS**: https://schwager.fr
- **Cookies**: Secure (HTTPS only)

### Environment Variables

| Variable                   | Description                  | Development    | Production         |
|----------------------------|------------------------------|----------------|--------------------|
| `DATABASE_URL`             | PostgreSQL connection string | Docker DB      | VPS DB             |
| `JWT_ACCESS_TOKEN_SECRET`  | JWT access token secret      | Dev secret     | Strong prod secret |
| `JWT_REFRESH_TOKEN_SECRET` | JWT refresh token secret     | Dev secret     | Strong prod secret |
| `CORS_ORIGIN`              | Allowed frontend origin      | localhost:3000 | schwager.fr        |
| `NODE_ENV`                 | Environment mode             | development    | production         |

## Authentication Flow

1. **Login** → Receives JWT tokens in secure cookies
2. **Authenticated Requests** → Cookies sent automatically
3. **Token Validation** → Middleware checks access token
4. **Role Authorization** → Endpoint-specific role requirements
5. **Logout** → Clears authentication cookies

## Project Structure

```
auth-api/
├── prisma/
│   ├── migrations/          # Database migrations
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Database seeding
├── src/
│   ├── config/              # Configuration files
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Express middleware
│   ├── routes/              # API routes
│   ├── schemas/             # Zod validation schemas
│   ├── services/            # Business logic
│   ├── types/               # TypeScript types
│   ├── utils/               # Utility functions
│   └── server.ts            # Express server setup
├── docker-compose.yml       # PostgreSQL for development
├── .env.local               # Development environment
├── .env.production          # Production environment
├── README.MD                # This file
├── tsconfig.json            # TypeScript configuration
├── swagger.json             # API documentation
└── package.json             # Dependencies and scripts
```

## Security Features

- **Argon2 Password Hashing** - Industry standard
- **JWT Tokens** - Stateless authentication
- **Secure Cookies** - HttpOnly, Secure, SameSite
- **Input Validation** - Zod schemas prevent injection
- **Role-based Access** - Granular permissions
- **Environment Separation** - Dev/prod configurations
- **CORS Protection** - Restricted origins

## Docker Commands

```bash
# Start PostgreSQL
docker-compose up -d

# Stop PostgreSQL
docker-compose down

# View logs
docker-compose logs postgres

# Reset PostgreSQL data
docker-compose down -v
```

## Production Deployment

### 1. Database Setup

```bash
# Create PostgreSQL user and database
sudo -u postgres psql
CREATE DATABASE auth_db_prod;
CREATE USER auth_user WITH ENCRYPTED PASSWORD 'your_strong_password';
GRANT ALL PRIVILEGES ON DATABASE auth_db_prod TO auth_user;
```

### 2. Application Deployment

```bash
# Install dependencies
npm ci --only=production

# Build application
npm run build

# Run migrations
npm run prisma:migrate

# Seed database (first time only)
npm run prisma:seed

# Start with PM2
npm run start:prod
```

## API Endpoints

| Method | Endpoint                | Description      | Auth | Role  |
|--------|-------------------------|------------------|------|-------|
| `GET`  | `/auth-api/healthcheck` | Health check     | ❌    | -     |
| `POST` | `/auth-api/auth/login`  | User login       | ❌    | -     |
| `POST` | `/auth-api/auth/logout` | User logout      | ✅    | -     |
| `GET`  | `/auth-api/auth/me`     | Get current user | ✅    | -     |
| `POST` | `/auth-api/users`       | Create new user  | ✅    | ADMIN |

## Troubleshooting

### Common Issues

**Database connection failed:**

```bash
# Check if PostgreSQL is running
docker ps

# Restart PostgreSQL
docker-compose restart postgres
```

**Prisma client not generated:**

```bash
npm run prisma:generate
```

**Migration errors:**

```bash
# Reset database (Deletes data)
npm run prisma:migrate reset
```

**Cookie authentication not working:**

- Check CORS origin configuration
- Verify NODE_ENV setting
- Ensure HTTPS in production

### Logs

```bash
# View application logs
npm run dev

# View database logs
docker-compose logs postgres
```


