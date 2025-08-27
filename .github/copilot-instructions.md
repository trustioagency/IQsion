# Copilot Instructions for AI Agents

## Project Overview
This is a full-stack marketing intelligence platform for SMEs, focused on e-commerce. It provides AI-powered analytics, competitor tracking, and automated marketing recommendations via a dashboard UI.

## Architecture & Key Components
- **Frontend**: React (TypeScript) with Vite, shadcn/ui (Radix UI + Tailwind CSS), Wouter for routing, TanStack Query for server state.
- **Backend**: Express.js (TypeScript), RESTful APIs, Drizzle ORM (PostgreSQL), Passport.js (Replit OAuth), connect-pg-simple for sessions.
- **AI Integration**: Google Gemini API for analytics, insights, and chat.
- **Database**: PostgreSQL (Neon serverless in production), Drizzle Kit for migrations.
- **Future Architecture**: We are transitioning to a Google Cloud Platform (GCP) based serverless architecture. Key future components will be **Firebase Authentication** (for Google/Email login), **Firebase Hosting** (for frontend), **Cloud Functions** (for backend), and **Firestore** (as the primary database).

## Data Flow
1. User authenticates via Replit OAuth; session stored in PostgreSQL.
2. Onboarding collects brand profile and business goals.
3. Users connect marketing platforms (Google Ads, Meta, TikTok, Shopify).
4. Metrics are fetched and stored; Gemini AI processes data for insights.
5. Dashboard displays analytics and recommendations; AI chat assistant available.

## Developer Workflows
- **Install dependencies**: `npm install`
- **Run locally**: `npm run dev` (requires a `.env` file in the project root with `DATABASE_URL` and `GEMINI_API_KEY` variables).
- **Backend dev**: Uses `tsx` for TypeScript execution.
- **Database migrations**: `npx drizzle-kit push` (see `drizzle.config.ts`)
- **Build frontend**: `npm run build` (Vite)
- **Production backend**: Compiled with ESBuild.

## Project Conventions
- **UI**: Use shadcn/ui and Radix primitives for all new components; style with Tailwind CSS.
- **State**: Use TanStack Query for server state, React hooks for local state.
- **Routing**: Use Wouter, not React Router.
- **Internationalization (i18n)**: All user-facing strings must be added to the translation files in `client/src/locales/` (`tr.json`, `en.json`) and referenced in the code via the `useLanguage` hook and `t()` function. Do not hard-code strings in components.
- **API**: All backend endpoints are in `Maint/server/routes.ts`.
- **DB**: Use Drizzle ORM for all queries/migrations; schema in `Maint/server/db.ts`.
- **AI**: All Gemini API calls are in backend; frontend interacts via REST endpoints.

## Integration Points
- **OAuth**: Replit OAuth via Passport.js (`Maint/server/replitAuth.ts`).
- **AI**: Google Gemini API (key in `.env`).
- **Planned**: Google Ads, Meta, TikTok, Shopify APIs.

## References
- **Frontend entry**: `Maint/attached_assets/index_1753609852222.tsx`
- **Backend entry**: `Maint/server/index.ts`
- **DB config**: `Maint/server/db.ts`, `drizzle.config.ts`
- **Component examples**: `Maint/attached_assets/`

## Notes
- Use simple, everyday language in UI and comments.
- Minimize unnecessary AI calls to save credits.
- Follow existing patterns for new features; reference files above for examples.