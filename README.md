# Learning Prisma

A Next.js developer notebook for learning relational data modeling and Prisma through account registration, protected note management, tags, and URL-driven search. The application lives in [`my-app/`](my-app/).

## Stack

- Next.js App Router, React, and TypeScript
- Prisma ORM 6 with SQLite for local development
- Tailwind CSS 4
- Node's `scrypt` for password hashing and database-backed opaque sessions

## Run Locally

```bash
cd my-app
cp .env.example .env
npm ci
npm run db:migrate
npm run db:seed
npm run dev
```

Open <http://localhost:3000>. The example database URL creates `prisma/dev.db`. The seed command creates the shared note tags; it does not create a demo account. Register through the application to create a user.

## Database Commands

- `npm run db:generate` generates the Prisma Client.
- `npm run db:migrate` creates/applies development migrations.
- `npx prisma migrate deploy` applies committed migrations in deployment environments.
- `npm run db:seed` creates or updates the default shared tags.

Set `DATABASE_URL` in `.env` to use another Prisma-supported SQLite location. For another provider, update the Prisma datasource, migration, and connection URL together.

## Verification

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

The test script applies the committed migrations to `prisma/test.db` and runs unit and SQLite integration tests. Database files are ignored by Git.
