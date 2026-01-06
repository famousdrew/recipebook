# Recipe Book

A Next.js application for managing and sharing recipes.

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your PostgreSQL connection string.

3. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

- **User**: User accounts
- **Recipe**: Recipe entries with title, description, instructions, times, servings
- **Ingredient**: Recipe ingredients with name, amount, unit
- **Category**: Recipe categories for organization
