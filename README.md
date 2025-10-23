# Groof Admin Panel

Admin panel for the Groof music discovery application built with Refine, React, TypeScript, and Ant Design.

## Features

- **Dashboard**: Overview statistics with interactive charts
  - User growth over time (24h, 7d, 30d, 90d)
  - Track interactions (likes/dislikes)
  - Real-time metrics

- **User Management**: Full CRUD operations
  - List all users with search and filtering
  - View user details
  - Edit user information and roles
  - Delete users (with protection against self-deletion)

- **Logs Viewer**: System logs monitoring
  - Filter by log level (error, warn, info, debug)
  - Search by message content
  - Filter by user ID and date range
  - View complete log details with metadata

- **System Health**: Real-time monitoring
  - MongoDB health and statistics
  - Redis health and memory usage
  - Auto-refreshes every 30 seconds

## Tech Stack

- **Framework**: Refine + React 18 + TypeScript
- **UI Library**: Ant Design 5.x
- **Routing**: React Router v6
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Auth**: Firebase Authentication with role-based access
- **Build Tool**: Vite
- **Deployment**: Vercel

## Setup

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Configure environment variables:
   \`\`\`bash
   cp .env.example .env.development
   \`\`\`

   Update `.env.development` with your Firebase and API configuration:
   - `VITE_API_URL`: Your groof-api backend URL
   - `VITE_FIREBASE_API_KEY`: Firebase API key
   - `VITE_FIREBASE_AUTH_DOMAIN`: Firebase auth domain
   - `VITE_FIREBASE_PROJECT_ID`: Firebase project ID

3. Start development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## Deployment

Deploy to Vercel:

\`\`\`bash
npm run deploy
\`\`\`

This will:
1. Build the production bundle
2. Deploy to Vercel with `--prod` flag

## Environment Variables

### Development (.env.development)
- Local development API endpoint
- Firebase development project

### Production (.env.production)
- Production API endpoint (https://api.groof.app)
- Firebase production project
- Configure in Vercel dashboard

## Project Structure

\`\`\`
groof-admin/
├── src/
│   ├── pages/            # Page components
│   │   ├── dashboard/    # Dashboard with charts
│   │   ├── users/        # User CRUD pages
│   │   ├── logs/         # Log viewer pages
│   │   ├── health/       # System health page
│   │   └── login/        # Login page
│   ├── providers/        # Auth and data providers
│   │   ├── authProvider.ts
│   │   └── dataProvider.ts
│   ├── contexts/         # Global state
│   │   └── TimeRangeContext.tsx
│   ├── types/            # TypeScript types
│   ├── config/           # Firebase configuration
│   └── App.tsx           # Main app component
├── .env.development      # Development environment
├── .env.production       # Production environment
├── vercel.json           # Vercel deployment config
└── package.json
\`\`\`

## Authentication

The admin panel requires:
1. Valid Firebase authentication
2. User must have `admin` role in their role array

Only users with admin role can access the admin panel.

## API Integration

Connects to groof-api backend endpoints:
- `/admin/auth/login` - Admin authentication
- `/admin/users` - User management
- `/admin/logs` - Log viewing
- `/admin/statistics` - Dashboard statistics
- `/admin/health` - System health

All requests include Firebase ID token in Authorization header.

## Code Style

- Single quotes, no semicolons
- 2-space indentation
- Functional components with TypeScript
- Matches groof-api style guide
