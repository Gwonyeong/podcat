# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Podcat is a Korean AI podcast platform built with Next.js 15, featuring calendar-based audio content selection, user management, and an admin dashboard.

## Development Commands

```bash
# Install dependencies
yarn install

# Run development server
yarn dev

# Build production
yarn build

# Start production server
yarn start

# Lint code
yarn lint

# Prisma commands
yarn prisma generate  # Generate Prisma client to /src/generated/prisma
yarn prisma migrate dev  # Run migrations in development
yarn prisma studio  # Open Prisma Studio
```

## Architecture & Key Patterns

### Tech Stack
- **Framework**: Next.js 15.5.0 with App Router
- **Database**: PostgreSQL with Prisma ORM (custom client location: `/src/generated/prisma`)
- **Authentication**: NextAuth with Kakao OAuth
- **State Management**: Zustand
- **Styling**: Tailwind CSS with custom Korean design system
- **TypeScript**: Strict mode enabled

### Database Schema
- NextAuth models (User, Account, Session, VerificationToken)
- Audio model with Category relationship (free/paid tiers)
- Application model for user submissions with consent tracking
- UserActivity for detailed analytics

### Project Structure
```
src/
├── app/               # Next.js App Router pages
│   ├── admin/        # Admin dashboard (audio, category, application management)
│   ├── api/          # RESTful API routes
│   ├── main/         # Main user interface
│   └── auth/         # Authentication pages
├── components/       # Reusable UI components
├── lib/             # Core utilities (auth, database, utils)
├── generated/       # Prisma client output
└── types/           # TypeScript type definitions
```

### API Structure
All API routes follow RESTful conventions:
- `/api/admin/audio` - Audio CRUD operations
- `/api/admin/category` - Category management
- `/api/admin/application` - User application handling
- `/api/track` - User activity tracking

### Authentication Flow
1. NextAuth configured with Kakao provider
2. Session management via JWT
3. Protected routes use `authOptions` from `/src/lib/auth.ts`
4. Admin access requires specific user roles

### State Management
Zustand stores located in `/src/stores/`:
- `useMicStore` - Microphone permissions
- `useStore` - Global application state
- `useModalStore` - Modal state management

### Important Implementation Details
- **Custom Prisma Client**: Always import from `/src/lib/prisma.ts`, not default location
- **Activity Tracking**: All user interactions tracked via `/api/track` endpoint
- **Korean Localization**: Uses Pretendard and Inter fonts with Korean metadata
- **PWA Support**: Service worker and manifest configured for installable app
- **Mobile Optimization**: Bottom sheet UI patterns for mobile devices
- **File Storage**: Uses Supabase Storage for audio files, thumbnails, and presenter images
  - Audio files stored in `audio/` bucket
  - Thumbnails stored in `thumbnails/` bucket  
  - Presenter images stored in `presenter-images/` bucket

### Environment Variables Required
```
DATABASE_URL          # PostgreSQL connection string
NEXTAUTH_URL         # Authentication URL
NEXTAUTH_SECRET      # NextAuth secret key
KAKAO_CLIENT_ID      # Kakao OAuth client ID
KAKAO_CLIENT_SECRET  # Kakao OAuth client secret

# Supabase Configuration (for file uploads)
NEXT_PUBLIC_SUPABASE_URL    # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY # Supabase public anon key
SUPABASE_SERVICE_ROLE_KEY   # Supabase service role key for server operations
SUPABASE_STORAGE_BUCKET     # Supabase storage bucket name (default: podcat-files)
```

### Common Development Tasks

When modifying database schema:
1. Edit `prisma/schema.prisma`
2. Run `yarn prisma migrate dev` to create migration
3. Run `yarn prisma generate` to update client

When adding new API routes:
- Follow existing pattern in `/src/app/api/`
- Include proper error handling
- Add activity tracking where appropriate

When working with audio features:
- Audio model includes title, audioUrl, imageUrl, category, script, description
- Categories determine access level (free/paid)
- Admin interface uses tab-based navigation