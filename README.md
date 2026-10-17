# Abhishek Tiwari - Full-Stack Developer Portfolio

A responsive, dark-themed portfolio built with Next.js, React, TypeScript, and Tailwind CSS. It presents Abhishek's background, skills, selected projects, experience, education, and contact links.

The portfolio is public: visitors can browse it without signing in or submitting personal information. It does not use authentication or visitor tracking and requires no environment variables to run.

## Features

- Responsive navigation and layouts for mobile, tablet, and desktop.
- Hero, About, Skills, Projects, Experience, Education, Contact, and Footer sections.
- Four project cards with descriptions, technologies, and supported feature details.
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

Open [http://localhost:3000](http://localhost:3000) to view the portfolio.

No `.env` file or OAuth configuration is required for the public site.

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
