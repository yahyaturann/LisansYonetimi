# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Türkçe, SaaS uyumlu lisans yönetim sistemi. Farklı yazılım projeleri için lisans üretme, doğrulama, aktivasyon takibi ve yönetim paneli sağlar. Monorepo yapısı ile Express.js backend ve Next.js frontend birlikte geliştirilir.

## Technology Stack

- **Backend**: Express.js + TypeScript, Prisma ORM, PostgreSQL
- **Frontend**: Next.js 15 App Router, React 19, Tailwind CSS 4
- **Authentication**: JWT token-based admin sessions
- **Testing**: Vitest for backend tests
- **Package Management**: npm workspaces

## Development Commands

### Root Commands (monorepo level)
```bash
npm run dev              # Start both API (4000) and Web (3000) servers concurrently
npm run build            # Build both API and Web
npm run lint             # Lint both API and Web
npm run test             # Run API tests with Vitest
```

### Backend Commands (apps/api)
```bash
cd apps/api
npm run dev              # Start API server with hot reload (tsx watch)
npm run build            # Build TypeScript to dist/
npm run start            # Start production build
npm run lint             # TypeScript type checking
npm run test             # Run Vitest tests
npm run db:generate      # Generate Prisma client
npm run db:push          # Push Prisma schema to database (dev only)
npm run db:seed          # Seed database with default admin user
```

### Frontend Commands (apps/web)
```bash
cd apps/web
npm run dev              # Start Next.js dev server on port 3000
npm run build            # Build Next.js production build
npm run start            # Start production build
npm run lint             # Run ESLint
```

## Architecture

### Monorepo Structure
- Root: Configuration and workspace scripts
- `apps/api`: Express.js backend with API endpoints and business logic
- `apps/web`: Next.js 15 App Router frontend with admin panel

### Backend Structure (apps/api/src)
```
src/
├── app.ts                  # Express app factory
├── server.ts               # Server entry point
├── config/
│   └── env.ts              # Environment validation with Zod
├── middleware/
│   ├── admin-yetki-middleware.ts    # JWT auth for admin routes
│   ├── hata-middleware.ts           # Error handling
│   ├── istek-gunlugu-middleware.ts  # Request logging
│   └── rate-limit-middleware.ts     # Rate limiting (120/min general, 60/min license)
├── routes/
│   ├── admin-auth-routes.ts          # POST /api/admin/auth/login
│   ├── admin-dashboard-routes.ts     # GET /api/admin/dashboard
│   ├── admin-project-routes.ts       # CRUD for projects
│   ├── admin-license-routes.ts       # CRUD for licenses
│   ├── admin-log-routes.ts           # GET /api/admin/logs
│   └── license-routes.ts             # POST /api/license/validate
├── services/
│   ├── auth-servisi.ts               # Admin authentication
│   ├── dashboard-servisi.ts          # Dashboard statistics
│   ├── lisans-servisi.ts             # License CRUD operations
│   ├── lisans-dogrulama-servisi.ts   # License validation logic
│   ├── proje-servisi.ts              # Project CRUD operations
│   ├── log-servisi.ts                # Log creation
│   └── prisma-depolari.ts            # Prisma repository pattern
├── lib/
│   ├── prisma.ts                     # Prisma client singleton
│   └── bellek-prisma.ts              # In-memory Prisma mock for testing
├── utils/
│   ├── api-key.ts                    # API key generation (randomUUID)
│   ├── jwt.ts                        # JWT token generation/validation
│   ├── license-key.ts                # License key generation (LIS-XXXX-XXXX)
│   └── zaman.ts                      # Date utilities
├── types/
│   └── domain.ts                     # Domain types (DogrulamaSonucu, ProjeAyarlari, etc.)
└── prisma/
    ├── schema.prisma                 # Database schema
    └── seed.ts                       # Initial admin user seed
```

### Frontend Structure (apps/web/src)
```
src/
├── app/
│   ├── layout.tsx                    # Root layout with providers
│   ├── page.tsx                      # Landing page
│   ├── giris/                        # Login page
│   │   └── page.tsx
│   └── panel/                        # Admin panel
│       ├── page.tsx                  # Dashboard overview
│       ├── projeler/                 # Project management
│       ├── lisanslar/                # License management
│       └── loglar/                   # Log viewing
├── components/
│   ├── giris-formu.tsx               # Login form component
│   ├── dashboard-ozeti.tsx           # Dashboard statistics cards
│   ├── panel-kabugu.tsx              # Admin panel shell
│   ├── projeler-yonetimi.tsx         # Projects management page
│   ├── lisanslar-yonetimi.tsx        # Licenses management page
│   └── loglar-paneli.tsx             # Logs viewing page
└── lib/
    ├── ayarlar.ts                    # API base URL configuration
    ├── bicimlendir.ts                # Response formatting utilities
    ├── istemci-api.ts                # API client for external API calls
    ├── panel-api.ts                  # API client for admin panel
    └── turler.ts                     # TypeScript types
```

## Database Schema

### Tables
- **users**: Admin users (email, password hash, created_at)
- **projects**: Software projects with API keys and settings (JSON)
- **licenses**: License keys with expiration and metadata (JSON)
- **activations**: Successful validation records
- **logs**: System event logging

### Settings Structure (Project.settings JSON)
```typescript
{
  domain_kontrol: boolean,   // Domain validation
  ip_kontrol: boolean,       // IP validation
  hwid_kontrol: boolean,     // HWID validation
  sure_kontrol: boolean,     // Expiration validation
  aktivasyon_limiti: boolean // Max activations limit
}
```

### License Metadata (License.metadata JSON)
```typescript
{
  domain?: string,   // Allowed domain
  ip?: string,       // Allowed IP
  hwid?: string      // Allowed HWID
}
```

## Key Patterns

### License Validation Flow
1. Project and API key validation
2. License existence and expiration check
3. Activation limit check (if enabled)
4. Domain/IP/HWID validation (based on project settings)
5. Activation record creation on success
6. Log entry creation

### Middleware Chain
```
helmet() → cors() → express.json() → istekGunluguMiddleware → rateLimit → routes → errorMiddleware
```

### Admin Auth
- JWT token in `Authorization: Bearer <token>` header
- Middleware validates token against `env.JWT_SECRET`
- Request object extended with `req.admin` (id, email)

### API Response Format
```typescript
// Success
{ success: true, message: "string", data?: any }

// Error
{ success: false, message: "string" }
```

### Demo Mode Testing
When `DEMO_MODU=true` in `.env`, the system uses `bellekPrisma` (in-memory mock) instead of real PostgreSQL. This is useful for development and testing without database setup.

## Environment Variables

Required in `.env`:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for JWT token signing (min 10 chars)
- `ADMIN_EMAIL`: Default admin email
- `ADMIN_PASSWORD`: Default admin password (min 6 chars)
- `NEXT_PUBLIC_API_URL`: Frontend API base URL
- `PORT`: API server port (default 4000)
- `DEMO_MODU`: "true" or "false" for in-memory mode

## Testing

Backend uses Vitest. Tests are located in `src/services/*.test.ts`:

```bash
npm run test                    # Run all tests
npm run test:api               # Run API tests
```

Tests use the in-memory `bellekPrisma` mock which simulates the database with in-memory arrays.

## Important Notes

- All error messages are in Turkish
- API responses use Turkish messages
- Projects are isolated by API key
- Licenses belong to projects
- Cascade delete on project deletion removes related licenses, activations, and logs
- Rate limiting: 120 requests/min for general API, 60 requests/min for license validation
- Admin routes require JWT authentication (401 if missing/invalid)
- License validation route uses `x-api-key` header for project authentication