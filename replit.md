# Montunos Whitelist

A Discord OAuth2 authentication application that verifies users against a Google Forms whitelist.

## Overview

This application allows users to:
- Log in with their Discord account via OAuth2
- Check their whitelist status based on Google Forms responses
- View their Discord profile information
- See detailed verification status (approved/pending/rejected/not found)

## Architecture

### Frontend
- **Framework**: React with TypeScript
- **Routing**: Wouter
- **Styling**: Tailwind CSS with Discord-themed colors (Blurple primary)
- **State Management**: TanStack Query for server state
- **UI Components**: Shadcn UI components with custom Discord branding

### Backend
- **Framework**: Express.js with TypeScript
- **Authentication**: Passport.js with Discord OAuth2 strategy
- **Session Management**: Express-session (in-memory storage for development)
- **Data Storage**: In-memory storage (MemStorage) for user data
- **API Integration**: Google Sheets API to read whitelist data

### Key Features Implemented
1. **Discord OAuth2 Login**: Secure authentication flow using Discord's OAuth2
2. **Google Sheets Integration**: Reads whitelist data from Google Form responses
3. **Session-based Authentication**: Maintains user login state
4. **Whitelist Verification**: Matches users by Discord ID, username, or email
5. **Beautiful UI**: Discord-branded interface with proper loading/error states

## Project Structure

```
├── client/src/
│   ├── components/          # Reusable UI components
│   │   ├── discord-icon.tsx
│   │   ├── loading-spinner.tsx
│   │   ├── user-profile-card.tsx
│   │   └── whitelist-status-card.tsx
│   ├── pages/              # Route pages
│   │   ├── login.tsx
│   │   ├── dashboard.tsx
│   │   └── auth-callback.tsx
│   └── App.tsx             # Main app with routing
├── server/
│   ├── auth.ts            # Passport Discord OAuth2 setup
│   ├── google-sheets.ts   # Google Sheets API integration
│   ├── routes.ts          # API endpoints
│   ├── storage.ts         # In-memory user storage
│   └── index.ts           # Express server setup
└── shared/
    └── schema.ts          # Shared TypeScript types
```

## Environment Variables

Required secrets (already configured in Replit):
- `DISCORD_CLIENT_ID`: Discord application client ID
- `DISCORD_CLIENT_SECRET`: Discord application client secret
- `DISCORD_REDIRECT_URI`: OAuth2 redirect URI (e.g., `http://localhost:5000/api/auth/discord/callback`)
- `GOOGLE_SHEETS_SPREADSHEET_ID`: Google Sheets spreadsheet ID containing whitelist
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`: Google service account email
- `GOOGLE_PRIVATE_KEY`: Google service account private key
- `SESSION_SECRET`: Session encryption secret (optional, defaults to development secret)

## Google Sheets Format

The application expects a Google Sheet with the following columns (case-insensitive):
- **Discord Username** or **Discord Name**: The Discord username
- **Discord ID** (optional): The numeric Discord user ID
- **Email** (optional): User's email address
- **Status** (optional): `approved`, `pending`, or `rejected` (defaults to `approved`)
- **Timestamp** (optional): Submission timestamp

The first row should contain headers. All subsequent rows are treated as whitelist entries.

## API Endpoints

### Authentication
- `GET /api/auth/discord` - Initiates Discord OAuth2 flow
- `GET /api/auth/discord/callback` - OAuth2 callback handler
- `GET /api/auth/user` - Returns current authenticated user (requires auth)
- `POST /api/auth/logout` - Logs out the current user

### Whitelist
- `GET /api/whitelist/check` - Checks current user's whitelist status (requires auth)

## User Flow

1. User visits the landing page and clicks "Continue with Discord"
2. User is redirected to Discord OAuth2 authorization
3. After authorization, user is redirected back to the app
4. Dashboard displays user profile and whitelist verification status
5. Whitelist status is automatically checked against Google Sheets data
6. User can log out to return to the login page

## Security Considerations

### For Development
- Using in-memory session storage (MemoryStore)
- Session secret has a development fallback
- Sessions are not persisted between server restarts

### For Production Deployment
**IMPORTANT**: Before deploying to production, you must:

1. **Configure a Strong Session Secret**:
   - Set `SESSION_SECRET` environment variable to a long, random string
   - Generate with: `openssl rand -base64 32`
   - Never commit this to version control

2. **Use a Durable Session Store**:
   - Current implementation uses in-memory storage (sessions lost on restart)
   - For production, integrate a persistent session store:
     - `connect-pg-simple` for PostgreSQL
     - `connect-redis` for Redis
     - Or another compatible session store

3. **Enable Secure Cookies**:
   - The app already sets `secure: true` in production mode
   - Ensure your deployment uses HTTPS

4. **Database Persistence** (optional):
   - Current user data uses in-memory storage
   - For production, consider migrating to PostgreSQL using Drizzle ORM
   - Schema is already defined in `shared/schema.ts`

## Design System

### Colors (Discord-themed)
- **Primary**: Discord Blurple (#5865F2)
- **Success**: Green for approved status
- **Warning**: Amber for pending status
- **Destructive**: Red for rejected/error status

### Typography
- **Primary Font**: Inter (UI and body text)
- **Display Font**: Poppins (headings and titles)
- **Mono Font**: Monospace (Discord IDs and technical data)

### Component Guidelines
- Uses Shadcn UI components as base
- Custom Discord branding and colors
- Consistent spacing and elevation
- Responsive design for mobile and desktop
- Beautiful loading states with spinners
- Comprehensive error handling with user-friendly messages

## Development

The app runs on port 5000 with both frontend and backend served together.

```bash
npm run dev
```

## Recent Changes

- Implemented Discord OAuth2 authentication flow
- Added Google Sheets API integration for whitelist verification
- Created beautiful Discord-branded UI with proper design system
- Added session management and authentication middleware
- Implemented proper error handling and loading states
- Fixed redirect logic to avoid React render errors
