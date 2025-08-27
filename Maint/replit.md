# Overview

This is a modern full-stack web application built as a marketing intelligence platform for SMEs (Small-Medium Enterprises), specifically targeting e-commerce businesses. The platform provides AI-powered analytics, market analysis, competitor tracking, and automated marketing recommendations through an intuitive dashboard interface.

## User Preferences

Preferred communication style: Simple, everyday language.
Kredi tasarrufu: AI özelliklerini minimal kullan, sadece gerekli düzeltmeleri yap.

## System Architecture

The application follows a clean full-stack architecture with the following key design decisions:

**Frontend**: React with TypeScript using Vite for build tooling and development server. The UI is built with shadcn/ui components (Radix primitives + Tailwind CSS) for a modern, accessible interface.

**Backend**: Express.js server with TypeScript providing RESTful APIs and authentication.

**Database**: PostgreSQL with Drizzle ORM for type-safe database operations and migrations.

**Authentication**: Replit-based OAuth integration with session management using connect-pg-simple.

**AI Integration**: Google Gemini AI for market analysis, performance insights, and chat functionality.

## Key Components

### Frontend Architecture
- **Component Library**: shadcn/ui with Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query for server state and React hooks for local state  
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite with React plugin and TypeScript support

### Backend Architecture
- **API Framework**: Express.js with TypeScript
- **Database Layer**: Drizzle ORM with PostgreSQL
- **Authentication**: Passport.js with OpenID Connect (Replit OAuth)
- **Session Storage**: PostgreSQL-backed sessions with connect-pg-simple
- **AI Services**: Google Gemini integration for analytics and chat

### Database Schema
- **Users**: User profiles and authentication data
- **Brand Profiles**: Business information and onboarding data
- **Platform Connections**: Integration status with marketing platforms
- **Marketing Metrics**: Performance data from connected platforms
- **AI Analysis**: Cached AI-generated insights and recommendations
- **Tasks**: User action items and recommendations
- **Sessions**: Authentication session storage

## Data Flow

1. **Authentication Flow**: Users authenticate via Replit OAuth, sessions stored in PostgreSQL
2. **Onboarding**: Brand profile creation with business model, industry, and goals
3. **Platform Integration**: Connect marketing platforms (Google Ads, Meta, TikTok)
4. **Data Collection**: Fetch and store marketing metrics from connected platforms
5. **AI Analysis**: Process data through Gemini AI for insights and recommendations
6. **Dashboard Display**: Present analytics through interactive widgets and charts
7. **Real-time Chat**: AI assistant powered by Gemini for contextual help

## External Dependencies

### Core Dependencies
- **Database**: PostgreSQL via Neon serverless connection
- **AI Service**: Google Gemini API for analysis and chat
- **Authentication**: Replit OAuth provider
- **UI Components**: Radix UI primitives via shadcn/ui

### Platform Integrations
- Google Ads API (planned)
- Meta Marketing API (planned) 
- TikTok Ads API (planned)
- Shopify API (planned)

### Development Tools
- Vite for frontend development and building
- Drizzle Kit for database migrations
- TypeScript for type safety
- ESBuild for server bundling

## Deployment Strategy

**Development**: 
- Frontend served by Vite dev server with HMR
- Backend runs with tsx for TypeScript execution
- Database migrations via Drizzle Kit

**Production**:
- Frontend built with Vite and served statically
- Backend compiled with ESBuild to single JS bundle
- PostgreSQL database with connection pooling
- Environment variables for API keys and database URL

The application is designed to be deployed on Replit with automatic environment provisioning and OAuth integration. The build process creates optimized bundles for both client and server code.