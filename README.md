# Edrisa Portfolio

Personal portfolio website for Edrisa, focused on creative direction, branding, advertising, digital design and selected work.

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React
- React Icons

## Development

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

```bash
npm run lint
npm run typecheck
npm run build
```

## Content Studio

`/studio` is a private admin for portfolio content. The public design stays in code. Content will live in Neon PostgreSQL. Only the GitHub account EddyKats can sign in.

Copy `.env.example` to `.env.local` and fill in the values there. Do not commit `.env.local`.

- `DATABASE_URL` — Neon connection string
- `AUTH_SECRET` — session encryption secret
- `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET` — GitHub OAuth app

The GitHub OAuth callback is `/api/auth/callback/github`.

After the database exists:

```bash
npm run db:migrate
npm run db:seed
```

`db:migrate` creates a versioned Prisma migration. `db:seed` copies the current `data/*.ts` content into Neon. It does not invent missing facts, and it does not assign software to projects.

Code changes still travel local → GitHub → Vercel. Content changes do not. Saving in `/studio` writes to Neon and calls `revalidatePath` for `/portfolio` and `/portfolio/[slug]`. The public portfolio reads Neon. Home, About, Services, and Contact still read `data/*.ts`.

Portfolio images go to the Neon Object Storage bucket `edrisa-media`. Studio uploads allow JPEG, PNG, WebP, and AVIF up to 12 MB. The file is sent directly to storage with a short-lived upload URL so it can be larger than a Vercel request body. Postgres stores the public URL and image metadata only.

Preview deployments are generated from `feature/content-studio` during development. Preview deployments should not share a production database once content editing goes live. A Neon branch per preview is the later step. This branch does not switch production over to the database.
