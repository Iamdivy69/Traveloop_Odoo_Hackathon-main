# Traveloop Backend

Personalized multi-city travel planning API built with Node.js, Express, TypeScript, Prisma, and PostgreSQL.

## Prerequisites

- **Node.js 20 LTS** (or later)
- **PostgreSQL 15** (or later)

### PostgreSQL Setup (Windows)

1. **Download** the installer from https://www.postgresql.org/download/windows/
2. **Run the installer** — use the default port `5432` and set a password for the `postgres` user (remember this password!)
3. **Create the database**:
   - Open **pgAdmin** (installed with PostgreSQL) or use the **SQL Shell (psql)**
   - In psql, run:
     ```sql
     CREATE DATABASE traveloop;
     ```
   - Or in pgAdmin: right-click "Databases" → "Create" → "Database..." → Name: `traveloop`

4. **Enable UUID extension** (Prisma migrations will handle this, but you can also do it manually):
   ```sql
   \c traveloop
   CREATE EXTENSION IF NOT EXISTS "pgcrypto";
   ```

> **Alternative: Use Docker**
> ```bash
> docker run --name traveloop-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=traveloop -p 5432:5432 -d postgres:15
> ```

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env and set your DATABASE_URL and JWT_SECRET:
# DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/traveloop
# JWT_SECRET=your-very-long-secret-key-here-32chars-minimum

# 3. Run database migrations
npx prisma migrate dev --name init

# 4. Seed cities and activities data
npm run seed

# 5. Start the dev server
npm run dev
```

The server will start at `http://localhost:3000`.

## API Endpoints

All endpoints are prefixed with `/api/v1/`.

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | Public | Create account, returns JWT |
| POST | `/auth/login` | Public | Login, returns JWT |
| GET | `/auth/me` | JWT | Get current user profile |

### Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/me` | JWT | Get profile with saved_destinations |
| PATCH | `/users/me` | JWT | Update name, photo, language |
| DELETE | `/users/me` | JWT | Delete account (cascades) |
| PATCH | `/users/me/password` | JWT | Change password |

### Trips
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/trips` | JWT | List user's trips (?upcoming=true) |
| POST | `/trips` | JWT | Create a trip |
| GET | `/trips/:id` | JWT | Get trip with stops & activities |
| PATCH | `/trips/:id` | JWT | Update trip |
| DELETE | `/trips/:id` | JWT | Delete trip (cascades) |
| PATCH | `/trips/:id/share` | JWT | Toggle public sharing |
| GET | `/trips/:id/budget` | JWT | Get budget breakdown |

### Public Sharing
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/public/:token` | Public | View shared trip |
| POST | `/public/:token/copy` | JWT | Copy shared trip to account |

### Cities
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/cities` | JWT | Search (?q=, ?region=, ?sort=) |
| GET | `/cities/:id` | JWT | City details |
| GET | `/cities/:id/activities` | JWT | Activities (?type=, ?max_cost=) |

### Trip Stops
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/trips/:id/stops` | JWT | List stops |
| POST | `/trips/:id/stops` | JWT | Add stop |
| PATCH | `/trips/:id/stops/:stopId` | JWT | Update stop dates |
| DELETE | `/trips/:id/stops/:stopId` | JWT | Remove stop |
| PATCH | `/trips/:id/stops/reorder` | JWT | Reorder stops |

### Stop Activities
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/trips/:id/stops/:stopId/activities` | JWT | List |
| POST | `/trips/:id/stops/:stopId/activities` | JWT | Add |
| PATCH | `/trips/:id/stops/:stopId/activities/:saId` | JWT | Update |
| DELETE | `/trips/:id/stops/:stopId/activities/:saId` | JWT | Remove |

### Packing Checklist
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/trips/:id/packing` | JWT | Get items (grouped) |
| POST | `/trips/:id/packing` | JWT | Add item |
| PATCH | `/trips/:id/packing/:itemId` | JWT | Toggle/update item |
| DELETE | `/trips/:id/packing/:itemId` | JWT | Remove item |
| DELETE | `/trips/:id/packing/reset` | JWT | Reset all to unpacked |

### Trip Notes
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/trips/:id/notes` | JWT | List (?stop_id=) |
| POST | `/trips/:id/notes` | JWT | Create note |
| PATCH | `/trips/:id/notes/:noteId` | JWT | Update note |
| DELETE | `/trips/:id/notes/:noteId` | JWT | Delete note |

### Admin (Optional)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/stats` | Admin | Platform statistics |
| GET | `/admin/users` | Admin | Paginated user list |
| GET | `/admin/trips` | Admin | All trips |

## Scripts

```bash
npm run dev       # Start dev server with hot reload
npm run build     # Compile TypeScript
npm run start     # Run compiled JS
npm run seed      # Seed cities & activities
npm run migrate   # Run Prisma migrations
npm run generate  # Regenerate Prisma client
npm run studio    # Open Prisma Studio (DB GUI)
```
