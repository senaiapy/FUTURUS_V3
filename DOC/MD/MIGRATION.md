create a full PLAN to use with antigravity to migrate a full stack laravel 11 Prediction Market App, running mariadb 10.6 and php 8.3, hosted in a LARAVEL folder and migrate this to FULLSTACK folder with, nextjs typescypt, tailwind, mobile recusive, language translator, nextauth, mobile recusive, wisth stackas @frontend, @admin, and @backend with nestjs, prisma,postgres database, typescript. Analyze all LARAVEL files libs, functions, database, api, admin panel, frontend and backend. .env variables, database seeded in SQL folder, design and layout, and create all the same wih nextjs and nestjs and postgres, and add others libs if necessary to clone full LARAVEL project.

This is a significant architectural shift—moving from a monolithic PHP/Laravel structure to a decoupled, type-safe TypeScript ecosystem (NestJS + Next.js + Prisma). To ensure a successful migration with Antigravity, we need a comprehensive strategy that maps Laravel’s "magic" to the explicit structures of NestJS and Next.js.
Below is the Migration Blueprint and the custom Antigravity Skill definition to automate this transition.

1. Technical Mapping Table
To "clone" the project, we must map the Laravel 11 internals to the new stack:
Feature
Laravel 11 (Source)
New Stack (Target)
Core Framework
PHP 8.3 / Laravel
NestJS (Backend) / Next.js (Frontend)
Database / ORM
MariaDB 10.6 / Eloquent
PostgreSQL / Prisma ORM
Authentication
Laravel Breeze/Jetstream
NextAuth.js (Auth.js)
Styling
Tailwind CSS / Blade
Tailwind CSS / Shadcn UI
State/API
Axios / Blade Props
TanStack Query (React Query)
Validation
Form Requests
Zod / Class-Validator
Admin Panel
Filament / Nova / Custom
Dedicated Next.js Admin Route (@admin)


2. Antigravity Skill Definition: laravel-to-fullstack-ts
Copy and load this skill into your Antigravity environment to begin the automated analysis and generation.
YAML

skill: laravel-to-fullstack-ts
description: Migrates a Laravel 11 Monolith to a NestJS/Next.js/Postgres Microservices-style Architecture.
operations:
  - phase: analysis
    action: 
      - scan: "./LARAVEL/app/Models"
        convert_to: "Prisma Schemas (.prisma)"
      - scan: "./LARAVEL/routes/api.php"
        convert_to: "NestJS Controllers & Services"
      - scan: "./LARAVEL/resources/views"
        convert_to: "Next.js App Router Components (@frontend/@admin)"
      - scan: "./LARAVEL/database/seeders"
        convert_to: "Prisma Seed Scripts"

  - phase: transformation
    rules:
      - env_mapping: "Convert .env (DB_DATABASE, etc.) to DATABASE_URL for Prisma"
      - auth_logic: "Bridge Laravel Session/Sanctum logic to NextAuth JWT providers"
      - translation: "Extract __() helpers to next-intl or i18next"
      - responsive: "Apply mobile-first Tailwind patterns to all @frontend components"

  - phase: structure_generation
    folders:
      - FULLSTACK/frontend: "Next.js + Tailwind + NextAuth"
      - FULLSTACK/admin: "Next.js Dashboard + Roles"
      - FULLSTACK/backend: "NestJS + Prisma + Postgres"

3. Implementation Steps
Step A: The Backend (@backend)
Since you are moving from MariaDB to Postgres, the first step is the data layer. NestJS will house the business logic for the Prediction Market (calculating odds, settling bets, user balances).
	•	Prisma Setup: We will use npx prisma introspect or manual conversion to ensure Laravel’s bigIncrements and timestamps translate correctly to Postgres serial and timestamptz.
	•	NestJS Modules: Create specific modules for Markets, Users, and Payments.
Step B: The Frontend (@frontend & @admin)
The Next.js application will be split into two main zones for better security and performance:
	1	@frontend: The public/user-facing prediction interface. High focus on mobile responsiveness and real-time updates (via WebSockets or Polling).
	2	@admin: The management side for creating markets, managing users, and overseeing the "Predictive" data.
Step C: Translation & Localization
To replace Laravel’s translation files (/lang/*.json), we will implement next-intl.
	•	All hardcoded strings in the Blade files will be extracted into JSON files.
	•	The system will support dynamic language switching in the header.

4. Enhanced Library Recommendations
To match and exceed Laravel’s built-in features, I recommend adding these to your FULLSTACK folder:
	•	Decimal.js: Crucial for the @backend. Never use standard floats for prediction market balances or odds; Postgres decimal + Decimal.js ensures precision.
	•	Zod: Use this for end-to-end type safety. Your @backend validation and @frontend forms will share the same schemas.
	•	Lucide React: For a modern, lightweight icon set that works perfectly with Tailwind.
	•	Shadcn/UI: To quickly build the Admin Panel (@admin) using accessible, pre-styled components.

And use for this all agents in a @AI/agents folder and skills @AI/skills folders
