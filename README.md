# Snapterra

Snapterra is a **self-hosted**, unified Next.js application designed to be your personal dashboard for managing screenshots, links, and tasks. It combines a powerful PostgreSQL backend with a modern React frontend, all within the Next.js App Router.

> [!NOTE]
> Snapterra is built for developers and power users who want complete control over their data. By self-hosting, you ensure your screenshots and links remain private and under your own management.

## Features

- **Screenshots Gallery**: Upload and manage screenshots with automated tag management via Uploadthing.
- **Link Manager**: Save and organize important URLs with tags.
- **Task Tracker**: Manage your daily tasks with status filtering and optimistic updates.
- **Secure Auth**: JWT-based authentication with case-insensitive login and input validation.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL (Neon.tech)
- **File Storage**: Uploadthing
- **State Management**: TanStack Query (React Query)
- **Styling**: Tailwind CSS 4
- **Runtime**: Bun

## Getting Started

### 1. Prerequisites

- [Bun](https://bun.sh/) installed on your machine.
- A PostgreSQL database (e.g., [Neon.tech](https://neon.tech)).
- An [Uploadthing](https://uploadthing.com/) account for file storage.

### 2. Environment Setup

Create a `.env.local` file in the root directory and add the following variables:

```env
DATABASE_URL=your_postgresql_url
JWT_SECRET=your_jwt_secret
UPLOADTHING_TOKEN=your_uploadthing_token
UPLOADTHING_SECRET=your_uploadthing_secret
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
```

### 3. Installation

```bash
bun install
```

### 4. Database Setup

Ensure your database has the following tables: `users`, `screenshots`, `links`, `tasks`, and `tags`.

### 5. Running Locally

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Deployment

The easiest way to deploy is via [Vercel](https://vercel.com). Ensure you add all environment variables to your Vercel project settings.

## License

MIT
