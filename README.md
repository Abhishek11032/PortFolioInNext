# Abhishek Tiwari - Full-Stack Developer Portfolio

A responsive, dark-themed portfolio built with Next.js, React, TypeScript, and Tailwind CSS. It presents Abhishek's background, skills, selected projects, experience, education, and contact links.

The portfolio is public: visitors can browse it without signing in or submitting personal information. It does not use authentication, visitor tracking, analytics, or conversation storage. The optional AI Portfolio Assistant requires Gemini server environment variables.

## Features

- Responsive navigation and layouts for mobile, tablet, and desktop.
- Hero, About, Skills, Projects, Experience, Education, Contact, and Footer sections.
- Four project cards with descriptions, technologies, and supported feature details.
- Optional FAQ chat assistant powered by Google Gemini. Chat state exists only in browser memory while the page is open.
- Social and resume links where configured in the portfolio content.
- Accessible focus states and reduced-motion support.
- Dark navy surfaces with violet and cyan accents.

## Tech Stack

- Next.js 15 App Router
- React 19 and TypeScript
- Tailwind CSS 4
- ESLint 9

## Getting Started

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the portfolio. The portfolio works without Gemini configuration; chat requests return an actionable setup message until the server variables are configured.

## Gemini Assistant Setup

1. Create or select a project in [Google AI Studio](https://aistudio.google.com/) and create a Gemini API key.
2. Add `GEMINI_API_KEY` to the project-root `.env` file. Keep the key server-side; do not prefix it with `NEXT_PUBLIC_` or commit `.env`.
3. Set `GEMINI_MODEL` in the same `.env` file to a model enabled for your Gemini API account. Check Google's [current model list](https://ai.google.dev/gemini-api/docs/models) for availability.
4. Restart `npm run dev` after changing environment variables.
5. In production, add the Gemini variables and, if desired, the chat limit settings in the deployment platform's server-side environment settings, then redeploy or restart the application.

`GEMINI_MAX_OUTPUT_TOKENS` optionally controls the assistant output budget (default `2048`, maximum `8192`). The limit includes Gemini 3 reasoning tokens, so lower values can truncate the visible answer.

The `/api/chat` route accepts at most six recent messages, limits user questions to 500 characters and assistant context messages to 4,000 characters, caps model output, and cancels provider requests after 20 seconds. `CHAT_RATE_LIMIT_REQUESTS`, `CHAT_RATE_LIMIT_WINDOW_MS`, and `CHAT_MAX_CONCURRENT_REQUESTS` configure the initial server-side limits (10 requests, 60 seconds, and 3 concurrent requests by default). The in-memory rate limit is per client on Vercel, using its platform-provided forwarded client IP. On other hosts, the route uses a process-wide limit rather than trusting arbitrary forwarding headers. Both rate limits and the concurrency cap are process-local and best-effort; they are not reliable across multiple production instances. For multi-instance deployment, configure a shared rate-limit store such as Redis or a platform/edge rate-limiting service before exposing the assistant broadly. Chat messages are not persisted.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local development server with Turbopack. |
| `npm run lint` | Run ESLint across the project. |
| `npm run build` | Create an optimized production build. |
| `npm run start` | Serve the production build locally. |

To run a standalone TypeScript check:

```bash
npx tsc --noEmit
```

## Project Structure

```text
src/
+-- app/                  # App Router page, root layout, and global styles
+-- components/
|   +-- layout/            # Navbar and footer
|   +-- projects/          # Reusable project card
|   +-- sections/          # Portfolio page sections
|   +-- ui/                # Shared section heading and social links
+-- data/                  # Typed project, skill, and social-link content
+-- types/                 # Shared portfolio types
public/                    # Portfolio images, icons, and other static assets
```

Portfolio content is maintained in `src/data/` and the section components under `src/components/sections/`. The home route composes these components through `src/components/PortfolioPage.tsx`.

## Updating Portfolio Content

- Edit project descriptions and technology lists in `src/data/projects.ts`.
- Edit skill groups in `src/data/skills.ts`.
- Edit external profile links in `src/data/socialLinks.ts`.
- Update assistant facts by editing the existing project/skill data or verified profile facts in `src/lib/ai/portfolio-context.ts`.
- Update section copy in the corresponding component under `src/components/sections/`.
- Place or replace static images in `public/` and reference them by their public URL path.

Only add real project URLs and assets; do not present illustrative artwork as an application screenshot.

## Production

Build and run the production version:

```bash
npm run build
npm run start
```

The app can be deployed to a Next.js-compatible platform. No authentication, analytics, or visitor-data storage service is required.
