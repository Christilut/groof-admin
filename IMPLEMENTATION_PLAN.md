# Groof Admin Panel Implementation Plan

## Project Setup

### 1. Initialize Refine App
- Create React + TypeScript + Vite project in `groof-admin/` folder
- Install dependencies:
  - Refine core packages (@refinedev/core, @refinedev/react-router-v6, @refinedev/antd)
  - Ant Design (@ant-design/icons, antd)
  - Recharts (for charts)
  - Axios (HTTP client)
  - Firebase SDK (for authentication)
- Configure TypeScript with strict mode
- Setup ESLint and Prettier matching groof-api style (single quotes, no semicolons, 2-space indent)

### 2. Project Structure
```
groof-admin/
├── src/
│   ├── pages/
│   │   ├── dashboard/         # Main dashboard with stats
│   │   ├── users/             # User CRUD pages (list, show, edit)
│   │   ├── logs/              # Log viewer pages (list, show)
│   │   ├── health/            # System health page
│   │   └── login/             # Admin login page
│   ├── components/
│   │   ├── LogViewer/         # Colored log line component
│   │   └── StatsCard/         # Dashboard stat cards
│   ├── providers/
│   │   ├── authProvider.ts    # Firebase admin auth
│   │   └── dataProvider.ts    # Custom REST data provider for groof-api
│   ├── contexts/
│   │   └── TimeRangeContext.tsx  # Global time range state
│   ├── types/                 # TypeScript type definitions
│   └── App.tsx
├── .env.development           # Local development config
├── package.json
└── vite.config.ts
```

## Backend Updates (groof-api)

### 3. Add Role System to User Model
**File:** `groof-api/src/modules/users/userModel.ts`
- Add `Role` enum type (e.g., `admin`, `user`)
- Add `role: Role[]` property to User class with default `['user']`
- Export Role type for use in groof-shared

### 4. Admin Authentication Middleware
**File:** `groof-api/src/middlewares/admin-auth.ts`
- Create middleware that checks if user has `'admin'` in their `role` array
- Return 403 Forbidden if not admin
- Apply to all `/admin/*` routes

### 5. Admin Endpoints Implementation
Implement all endpoints documented in CLAUDE.md:

**Users Management:**
- `GET /admin/users` - List users with pagination, filtering, sorting
- `GET /admin/users/:id` - Get single user details
- `PATCH /admin/users/:id` - Update user (partial update)
- `DELETE /admin/users/:id` - Delete user (hard delete)

**Logs Management:**
- `GET /admin/logs` - List logs (paginated, with filters)
- `GET /admin/logs/:id` - Get complete log entry details
- `GET /admin/logs/search` - Search logs by criteria (level, message, date range, user ID)

**Statistics:**
- `GET /admin/statistics` - Get overview statistics
- `GET /admin/statistics/users` - User growth per day (new signups)
- `GET /admin/statistics/tracks` - Track interactions (likes/dislikes per day), total tracks

**System Health:**
- `GET /admin/health` - System health check (DB health/size, Redis stats/size)

**Authentication:**
- `POST /admin/auth/login` - Admin login (Firebase auth + role check)

## Frontend Implementation (groof-admin)

### 6. Authentication Provider
**File:** `src/providers/authProvider.ts`
- Implement Refine auth provider interface
- `login()`: Firebase email/password authentication
  - POST to `/admin/auth/login` with Firebase ID token
  - Backend verifies token and checks `role` includes `'admin'`
  - Store admin session token in localStorage
- `logout()`: Clear localStorage and Firebase session
- `check()`: Verify token is still valid
- `getIdentity()`: Return current admin user info

### 7. Data Provider
**File:** `src/providers/dataProvider.ts`
- Create custom REST data provider for groof-api `/admin/*` endpoints
- Map Refine methods to API routes:
  - `getList()` → GET `/admin/users`, `/admin/logs`
  - `getOne()` → GET `/admin/users/:id`, `/admin/logs/:id`
  - `update()` → PATCH `/admin/users/:id`
  - `deleteOne()` → DELETE `/admin/users/:id`
  - `custom()` → For statistics and health endpoints
- Handle pagination (default 1000 items)
- Add Authorization header with token
- Handle rate limiting errors (50 req/5min)

### 8. Global Time Range Context
**File:** `src/contexts/TimeRangeContext.tsx`
- React Context for global time range selection
- Options: Last 24 hours, Last 7 days, Last 30 days, Last 90 days
- Sync to URL query params
- Used by Dashboard and Logs pages

### 9. Login Page
**Route:** `/login`
**File:** `src/pages/login/index.tsx`
- Ant Design Form with email/password inputs
- Firebase authentication on submit
- Error handling:
  - Invalid credentials
  - User doesn't have admin role (403)
  - Network errors
- Redirect to `/` (dashboard) on success

### 10. Dashboard Page
**Route:** `/`
**File:** `src/pages/dashboard/index.tsx`

**Features:**
- Global time range dropdown in header (Last 24 hours, 7 days, 30 days, 90 days)
- Three main stat sections with Recharts visualizations:

**Interactions Chart:**
- Stacked bar chart showing likes vs dislikes per day
- Fetch from `GET /admin/statistics/tracks`
- X-axis: dates, Y-axis: count
- Two bars per day: green (likes), red (dislikes)

**User Growth Chart:**
- Line chart showing new user signups per day
- Fetch from `GET /admin/statistics/users`
- X-axis: dates, Y-axis: new users count

**Tracks Chart:**
- Line chart showing total tracks in database over time
- Fetch from `GET /admin/statistics/tracks`
- X-axis: dates, Y-axis: total tracks count

**Technical Details:**
- Auto-refresh every 5 minutes
- Loading skeletons while fetching
- Error states with retry button
- Responsive grid layout (1 column mobile, 2 columns tablet, 3 columns desktop)

### 11. Users Page
**Route:** `/users`
**Files:** `src/pages/users/list.tsx`, `show.tsx`, `edit.tsx`

**List View:**
- Ant Design Table with columns:
  - Email
  - Display Name
  - Provider (Firebase, Google, Apple)
  - Roles (badge display)
  - Created At (formatted date)
  - Updated At (formatted date)
  - Actions (view, edit, delete buttons)
- Search bar: filter by email or display name
- Sortable columns: created_at, updated_at
- Pagination controls
- Fetch from `GET /admin/users`

**Show View (`/users/:id`):**
- Display full user details in description list
- Show sign-in history table
- Show all user properties from User model

**Edit View (`/users/:id/edit`):**
- Form to update user fields:
  - Display name
  - Email
  - Country code
  - DJ mode toggle
  - Roles (multi-select)
- Save with `PATCH /admin/users/:id`

**Delete:**
- Confirmation dialog: "Are you sure you want to delete this user?"
- DELETE request to `/admin/users/:id`
- Success notification
- Navigate back to list

### 12. Logs Page
**Route:** `/logs`
**Files:** `src/pages/logs/list.tsx`, `show.tsx`

**List View:**
- Compact log viewer with custom LogViewer component
- Each row shows:
  - Timestamp (formatted)
  - Level (colored badge)
  - Message (truncated to 100 chars)
- Color coding by level:
  - Error: red background
  - Warn: yellow background
  - Info: blue background
  - Debug: gray background
- Click row to navigate to detail view
- Filters panel (left sidebar or top filters):
  - **Log level**: Dropdown (All, Error, Warn, Info, Debug)
  - **Search**: Input for full-text message search
  - **Date range**: Date range picker
  - **User ID**: Input for filtering admin audit logs
- Pagination with lazy loading (virtual scrolling for performance)
- Fetch from `GET /admin/logs`

**Show View (`/logs/:id`):**
- Full log details page
- Formatted JSON viewer for complete log object
- Syntax highlighting
- Copy to clipboard button

### 13. Health Page
**Route:** `/health`
**File:** `src/pages/health/index.tsx`

**Features:**
- Auto-refresh every 30 seconds
- Three stat cards:

**Database Card:**
- Connection status (green dot = connected)
- Database size (GB)
- Collection counts (users, tracks, interactions)
- Last backup time

**Redis Card:**
- Connection status
- Memory usage (MB / total MB)
- Cache hit rate percentage
- Number of keys

**API Health Card:**
- Overall status (healthy/degraded/down)
- Average response time (ms)
- Recent error rate (%)
- Uptime percentage

- Visual status indicators: green (healthy), yellow (warning), red (error)
- Fetch from `GET /admin/health`

### 14. Layout & Navigation

**Sidebar (Ant Design Sider):**
- Logo/title at top
- Menu items:
  - Dashboard (HomeOutlined icon) → `/`
  - Users (UserOutlined icon) → `/users`
  - Logs (FileTextOutlined icon) → `/logs`
  - Health (HeartOutlined icon) → `/health`
- Active route highlighting
- Collapsible on mobile

**Header (Ant Design Header):**
- Global time range selector dropdown (synced via TimeRangeContext)
- Admin user email display
- Logout button

### 15. Shared Components

**LogViewer Component:**
**File:** `src/components/LogViewer/index.tsx`
- Props: `{ level, timestamp, message, onClick }`
- Color-coded row based on log level
- Truncated message with "..." if too long
- Hover effect
- Click to navigate to detail view

**StatsCard Component:**
**File:** `src/components/StatsCard/index.tsx`
- Props: `{ title, value, chart, loading, error }`
- Ant Design Card wrapper
- Title at top
- Large value display (if no chart)
- Chart area (Recharts component)
- Loading skeleton state
- Error state with retry button
- Responsive sizing

## Styling & UI

### 16. Ant Design Theme Configuration
- Configure custom theme in App.tsx:
  - Primary color: Match groof-app brand color
  - Border radius: 8px
  - Font family: System fonts
- Responsive breakpoints:
  - xs: <576px (mobile)
  - sm: ≥576px (tablet)
  - md: ≥768px (desktop)
  - lg: ≥992px (large desktop)
- Optional: Dark mode support

## Error Handling & UX

### 17. Error States
- Toast notifications (Ant Design notification) for:
  - API errors
  - Network failures
  - Rate limiting (show countdown timer)
  - Success confirmations
- 404 page for invalid routes
- 403 page for unauthorized access
- Error boundaries for component crashes
- Retry mechanisms for failed requests

### 18. Loading States
- Skeleton loaders for:
  - Table rows (users, logs)
  - Stat cards on dashboard
  - Chart areas
- Spinner overlay for full-page loading
- Button loading states during actions
- Optimistic updates for edit/delete operations

## Configuration & Deployment

### 19. Environment Setup

**.env.development:**
```
VITE_API_URL=http://localhost:4008
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
```

**.env.production:**
```
VITE_API_URL=https://api.groof.app
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
```

### 20. Build & Deploy

**package.json scripts:**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "deploy": "vite build && vercel --prod"
  }
}
```

**Vercel Configuration:**
- Install Vercel CLI: `npm i -g vercel`
- Link project: `vercel link`
- Set environment variables in Vercel dashboard (production .env values)
- Deploy: `npm run deploy`
- Auto-deploys on push to main branch (configure in Vercel)

**vercel.json:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## Documentation Updates

### 21. Update CLAUDE.md

Add to **Monorepo Structure** section:
```
├── groof-admin/            # Admin web application
│   ├── src/
│   │   ├── pages/          # Admin pages (dashboard, users, logs, health)
│   │   ├── components/     # Reusable components
│   │   ├── providers/      # Auth and data providers
│   │   └── contexts/       # Global state (time range)
│   └── dist/               # Production build output
```

Add new section **Admin Web Application (groof-admin)**:
```markdown
### Admin Tech Stack
- **Framework**: Refine + React 18 + TypeScript
- **UI Library**: Ant Design 5.x
- **Routing**: React Router v6 (via Refine)
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Auth**: Firebase Authentication with role-based access
- **Build Tool**: Vite
- **State Management**: React Context (global time range)
- **Deployment**: Vercel

### Development Commands
```bash
cd groof-admin

# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build

# Deployment
npm run deploy           # Build and deploy to Vercel production
```

### Admin Features
- **Dashboard**: User growth, track statistics, interaction metrics (likes/dislikes)
- **User Management**: View, edit, delete users with search and filtering
- **Log Viewer**: Color-coded logs with search, filtering by level/date/user
- **System Health**: MongoDB and Redis monitoring with real-time stats
- **Global Time Range**: Switch between Last 24 hours, 7 days, 30 days, 90 days
```

## Implementation Order

### Phase 1: Backend Setup
1. Add Role enum and role property to User model
2. Create admin authentication middleware
3. Implement admin endpoints (users, logs, statistics, health)
4. Test endpoints with Postman/curl

### Phase 2: Admin App Foundation
5. Initialize Refine project
6. Setup auth provider with Firebase
7. Setup data provider for groof-api
8. Create login page
9. Setup layout with sidebar and header

### Phase 3: Core Pages
10. Implement Dashboard with charts
11. Implement Users CRUD pages
12. Implement Logs viewer
13. Implement Health monitoring page

### Phase 4: Polish & Deploy
14. Add error handling and loading states
15. Implement global time range context
16. Add responsive styling
17. Configure Vercel deployment
18. Update CLAUDE.md documentation
19. Test full flow end-to-end

## Tech Stack Summary

- **Framework**: Refine + React 18 + TypeScript
- **UI Library**: Ant Design 5.x
- **Routing**: React Router v6
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Auth**: Firebase with role-based access control
- **Build Tool**: Vite
- **State**: React Context
- **Deployment**: Vercel
- **Code Style**: Single quotes, no semicolons, 2-space indentation (matching groof-api)
