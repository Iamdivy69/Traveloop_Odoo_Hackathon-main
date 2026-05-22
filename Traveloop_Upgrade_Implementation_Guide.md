# Traveloop — Complete Upgrade Implementation Guide
## From Static MVP → AI-Powered Travel Ecosystem

> **How to use this guide:** Each phase is self-contained. Work through them in order. Each section includes the exact AI prompt to paste, what files to create/modify, and what to verify before moving on.

---

## Pre-Work: Codebase Audit Checklist

Before any feature work, run these commands and note your answers:

```bash
# 1. List all existing Prisma models
cat apps/backend/prisma/schema.prisma

# 2. List all existing API routes
find apps/backend/src/routes -name "*.ts" | sort

# 3. List all existing frontend pages
find apps/frontend/src/pages -name "*.tsx" | sort

# 4. List all existing hooks
find apps/frontend/src/hooks -name "*.ts" | sort

# 5. Check for hardcoded data
grep -r "hardcoded\|mockData\|fakeData\|\[\{id:" apps/frontend/src --include="*.tsx" -l
```

Save this output. Every AI prompt below will reference it.

---

## PHASE 0 — Foundation & Infrastructure (Day 1)

**Goal:** Set up the base infrastructure that everything else depends on.

### 0.1 — Prisma Schema Full Upgrade

**Prompt to use:**
```
I am working on Traveloop — a full-stack travel planning app.
Tech stack: Node.js + Express + Prisma + PostgreSQL + TypeScript.

Here is my CURRENT Prisma schema:
[PASTE YOUR FULL schema.prisma HERE]

I need to ADD these new models WITHOUT breaking existing ones:
1. Expense model — fields: id (UUID), tripId, title, amount (Decimal), currency (default "INR"), category (enum: FOOD, TRANSPORT, ACCOMMODATION, ACTIVITY, SHOPPING, OTHER), paidById (userId), splitWith (relation to User array), createdAt
2. Friend model — fields: id, requesterId, receiverId, status (enum: PENDING, ACCEPTED, DECLINED), createdAt
3. CommunityPost model — fields: id, userId, tripId (optional), content (text), imageUrl (optional), isPublic (bool default true), likes (int default 0), createdAt
4. Notification model — fields: id, userId, type (string), message, isRead (bool default false), createdAt

Rules:
- Preserve all existing models exactly as they are
- Add proper relations, UUIDs, cascading deletes
- Add @updatedAt to all new models
- Add proper indexes on foreign keys
- Output the complete updated schema.prisma file
```

**After getting schema:**
```bash
npx prisma migrate dev --name "add_social_expense_models"
npx prisma generate
```

**Verify:** No migration errors, `prisma studio` shows all tables.

---

### 0.2 — Backend Error Handling & Response Utilities

**Prompt to use:**
```
I am working on a Node.js + Express + TypeScript backend for Traveloop.

Create these shared utility files:

1. apps/backend/src/utils/response.ts
   - Standard API response helpers: sendSuccess(res, data, statusCode=200), sendError(res, message, statusCode=400)
   - Both must return: { success: boolean, data?, message?, timestamp }

2. apps/backend/src/utils/asyncHandler.ts  
   - Wraps async route handlers to catch errors automatically
   - Re-throws to Express error middleware

3. apps/backend/src/middleware/errorHandler.ts
   - Global Express error handler
   - Handles Prisma errors (P2002 = unique constraint, P2025 = not found)
   - Returns consistent JSON error responses with proper status codes
   - Never expose stack traces in production

4. apps/backend/src/utils/pagination.ts
   - parsePagination(query) → { page, limit, skip, take }
   - buildPaginatedResponse(data, total, page, limit) → { items, total, page, totalPages, hasNext }
   - Default: page=1, limit=20, maxLimit=100

Output each file separately with full TypeScript code.
```

---

### 0.3 — Frontend API Client & Query Setup

**Prompt to use:**
```
I am working on a React + TypeScript + TanStack Query frontend for Traveloop.

Create these base infrastructure files:

1. apps/frontend/src/lib/apiClient.ts
   - Axios instance with base URL from VITE_API_URL env var
   - Request interceptor: attach JWT from localStorage (key: "traveloop_token")
   - Response interceptor: on 401, clear token and redirect to /login
   - Typed error handler that extracts message from our { success, message } response format

2. apps/frontend/src/lib/queryClient.ts
   - TanStack Query QueryClient setup
   - defaultOptions: staleTime 5 minutes, retry 1 time, refetchOnWindowFocus false
   - Global error handler using toast notifications

3. apps/frontend/src/hooks/useToast.ts
   - Simple toast hook using a Zustand store
   - Actions: success(message), error(message), info(message)
   - Auto-dismiss after 3 seconds

4. apps/frontend/src/components/ui/Toast.tsx
   - Toast display component (top-right corner, slide-in animation with Framer Motion)
   - Success = green, Error = red, Info = blue
   - X button to manually dismiss

Output each file with full working TypeScript/React code.
```

---

## PHASE 1 — Authentication & User Profile (Day 1-2)

### 1.1 — Username System Backend

**Prompt to use:**
```
I am building the user profile system for Traveloop (Node.js + Express + Prisma + TypeScript).

My current User model has: id (UUID), email, password, name, createdAt.

I need to ADD to the User model (migration already done):
- username (String, unique, @db.VarChar(30))
- bio (String, optional, max 200 chars)
- avatarUrl (String, optional)
- isPublic (Boolean, default true)
- preferredCurrency (String, default "INR")

Create these backend files:

1. apps/backend/src/routes/user.routes.ts (UPDATE existing)
   Add routes:
   - GET /users/me — full profile
   - PUT /users/me — update profile (name, bio, isPublic, preferredCurrency)
   - PUT /users/me/username — update username (with validation)
   - GET /users/check-username?username=xyz — availability check (public, no auth)
   - GET /users/:username — public profile (public, no auth)
   - DELETE /users/me — soft delete account

2. apps/backend/src/controllers/user.controller.ts (UPDATE existing)
   Full implementation of all above routes using asyncHandler wrapper.

3. apps/backend/src/services/user.service.ts (UPDATE existing)
   Business logic:
   - Username rules: 3-30 chars, alphanumeric + underscores only, not starting with number
   - Check uniqueness before saving
   - Public profile: only return name, username, bio, avatarUrl, public trips

4. apps/backend/src/schemas/user.schema.ts
   Zod schemas for all request bodies.

My existing auth middleware is at: apps/backend/src/middleware/auth.middleware.ts
Use it for protected routes.
```

### 1.2 — Profile Frontend

**Prompt to use:**
```
I am building the Profile page for Traveloop (React + TypeScript + TailwindCSS + TanStack Query).

My API client is at: apps/frontend/src/lib/apiClient.ts
My auth store (Zustand) is at: apps/frontend/src/store/authStore.ts

Create these files:

1. apps/frontend/src/hooks/useProfile.ts
   - useMyProfile() → TanStack Query hook (GET /users/me)
   - useUpdateProfile() → mutation hook (PUT /users/me)
   - useUpdateUsername() → mutation hook with optimistic update (PUT /users/me/username)
   - useCheckUsername(username) → debounced query (GET /users/check-username?username=)
   - Invalidates ["profile"] query on mutations

2. apps/frontend/src/pages/Profile.tsx
   Full profile page with:
   - Avatar display with initials fallback (no image upload yet, just URL field)
   - Editable fields: name, bio, username (with live availability indicator)
   - Toggle: public/private profile
   - Currency preference dropdown (INR, USD, EUR, GBP, AED)
   - Loading skeleton while fetching
   - Save button with loading state
   - Error messages inline per field
   - Username: green checkmark if available, red X if taken, spinner while checking

Use TailwindCSS only. No hardcoded data. Clean, modern card layout.
Output complete working code.
```

---

## PHASE 2 — Dynamic Trip System (Day 2-3)

### 2.1 — Trip CRUD Backend

**Prompt to use:**
```
I am upgrading the Trip system for Traveloop (Express + Prisma + TypeScript).

My current Trip model fields: id, userId, title, description, coverImage, startDate, endDate, isPublic, shareToken, budget, currency, createdAt, updatedAt.

My current route file is at: [PASTE CONTENT OF apps/backend/src/routes/trip.routes.ts]
My current service file is at: [PASTE CONTENT OF apps/backend/src/services/trip.service.ts]

Upgrade the trip system:

1. apps/backend/src/services/trip.service.ts (FULL REWRITE)
   Implement:
   - createTrip(userId, data) — auto-generate shareToken (nanoid, 10 chars)
   - getMyTrips(userId, filters: { status?, search?, page, limit }) — paginated
     - status filter: "upcoming" (startDate > now), "active" (now between dates), "past" (endDate < now), "draft" (no dates)
   - getTripById(id, userId) — include stops count, activities count, total budget
   - updateTrip(id, userId, data) — ownership check
   - deleteTrip(id, userId) — ownership check, cascade handled by Prisma
   - getTripStats(id, userId) — { totalStops, totalActivities, totalExpenses, remainingBudget, dayCount }
   - getPublicTrip(shareToken) — no auth required
   - copyPublicTrip(shareToken, userId) — deep copy trip + stops + activities

2. apps/backend/src/schemas/trip.schema.ts (UPDATE)
   Zod schemas:
   - createTripSchema: title (required, max 100), description (optional, max 500), budget (optional, positive number), currency (default "INR"), startDate (optional ISO date), endDate (optional, must be after startDate), isPublic (bool), coverImage (optional URL)
   - updateTripSchema: all fields optional
   - tripFiltersSchema: status, search, page, limit

3. apps/backend/src/controllers/trip.controller.ts (UPDATE)
   Add: getTripStats endpoint, proper error messages, pagination headers.

Do not change route paths. Preserve auth middleware usage.
```

### 2.2 — Trip Frontend Hooks & My Trips Page

**Prompt to use:**
```
I am upgrading the My Trips page for Traveloop (React + TypeScript + TailwindCSS + TanStack Query + Framer Motion).

My API returns paginated trips: { items: Trip[], total, page, totalPages, hasNext }

Trip type:
interface Trip {
  id: string; userId: string; title: string; description?: string;
  coverImage?: string; startDate?: string; endDate?: string;
  isPublic: boolean; shareToken: string; budget?: number; currency: string;
  _count: { stops: number; activities: number };
  createdAt: string;
}

Create:

1. apps/frontend/src/hooks/useTrips.ts
   - useMyTrips(filters) — paginated query with ["trips", filters] key
   - useTrip(id) — single trip query
   - useCreateTrip() — mutation, invalidates ["trips"]
   - useUpdateTrip(id) — mutation, invalidates ["trips", id]
   - useDeleteTrip() — mutation with optimistic removal
   - useTripStats(id) — stats query

2. apps/frontend/src/pages/MyTrips.tsx (FULL REWRITE)
   Features:
   - Tab filter: All / Upcoming / Active / Past / Draft
   - Search bar (debounced, 400ms)
   - Trip cards in a responsive grid (2 cols desktop, 1 col mobile)
   - Each card: cover image or gradient fallback, title, dates, budget, stops count, share button, edit/delete menu
   - Empty state per tab (different message for each)
   - Loading skeleton (3 cards)
   - "New Trip" button → opens CreateTripModal
   - Infinite scroll or "Load more" button

3. apps/frontend/src/components/trips/CreateTripModal.tsx
   Modal form:
   - Title (required), Description (optional)
   - Date pickers for start/end (or skip for now)
   - Budget in preferred currency (from user profile)
   - Public/private toggle
   - Submit with loading state
   - Close on backdrop click

No hardcoded data. Full working TypeScript code.
```

---

## PHASE 3 — Itinerary Builder (Day 3-4)

### 3.1 — Stops & Activities Backend

**Prompt to use:**
```
I am building the Itinerary Builder backend for Traveloop (Express + Prisma + TypeScript).

My Prisma models:
- TripStop: id, tripId, cityId (optional), customLocation (optional), arrivalDate, departureDate, order (Int), notes, createdAt
- Activity: id, cityId (optional), title, description, category (enum), durationMinutes, cost, currency, createdAt  
- StopActivity: id, stopId, activityId (optional), customTitle, customCost, scheduledTime, notes, createdAt

Create complete backend for stops and activities:

1. apps/backend/src/routes/stop.routes.ts
   - GET /trips/:tripId/stops — all stops with activities, ordered
   - POST /trips/:tripId/stops — create stop
   - PUT /trips/:tripId/stops/:stopId — update stop
   - DELETE /trips/:tripId/stops/:stopId — delete stop
   - PUT /trips/:tripId/stops/reorder — reorder (body: { stopIds: string[] })

2. apps/backend/src/routes/stopActivity.routes.ts
   - GET /trips/:tripId/stops/:stopId/activities — list
   - POST /trips/:tripId/stops/:stopId/activities — add activity to stop
   - PUT /trips/:tripId/stops/:stopId/activities/:saId — update
   - DELETE /trips/:tripId/stops/:stopId/activities/:saId — remove

3. apps/backend/src/services/stop.service.ts
   - All CRUD with ownership verification (must own the trip)
   - reorderStops: update order field in a transaction
   - getStopsWithActivities: include full activity data, calculated subtotals

4. apps/backend/src/services/stopActivity.service.ts
   - Can add existing activities (by activityId) OR custom activities (customTitle + customCost)
   - getTripBudgetBreakdown(tripId): { byStop: [{stopId, name, total}], grandTotal }

5. apps/backend/src/schemas/stop.schema.ts + stopActivity.schema.ts
   Full Zod validation.

Enforce trip ownership in all operations. Use transactions for reorder.
```

### 3.2 — Itinerary Builder Frontend

**Prompt to use:**
```
I am building the Itinerary Builder page for Traveloop (React + TypeScript + TailwindCSS + TanStack Query + Framer Motion).

This is the most complex page. Build it step by step:

1. apps/frontend/src/hooks/useStops.ts
   - useStops(tripId) — query with full activities
   - useCreateStop(tripId) — mutation
   - useUpdateStop(tripId, stopId) — mutation  
   - useDeleteStop(tripId, stopId) — mutation
   - useReorderStops(tripId) — optimistic reorder mutation

2. apps/frontend/src/hooks/useStopActivities.ts
   - useStopActivities(tripId, stopId)
   - useAddActivity(tripId, stopId)
   - useUpdateStopActivity(tripId, stopId, saId)
   - useRemoveStopActivity(tripId, stopId, saId)

3. apps/frontend/src/pages/BuildItinerary.tsx (FULL BUILD)
   Layout: sidebar (trip summary + budget) + main area (stops timeline)
   
   Main area features:
   - Vertical timeline of stops (cards stacked with connecting line)
   - Each stop card: city/location name, dates, activity list inside
   - Reorder stops with up/down arrow buttons (or note as "drag-drop ready")
   - Add stop button at bottom
   - Add activity button inside each stop → opens ActivityPickerModal
   
   Stop card features:
   - Collapsible (show/hide activities)
   - Edit location/dates inline
   - Activity list: name, time, cost, notes, delete button
   - Stop subtotal displayed

4. apps/frontend/src/components/itinerary/AddStopModal.tsx
   Fields: city search (autocomplete from /cities), custom location fallback, arrival date, departure date, notes.

5. apps/frontend/src/components/itinerary/ActivityPickerModal.tsx
   - Search existing activities from the city
   - OR create a custom activity (title, cost, duration, notes, scheduled time)
   - Add to stop button

No hardcoded stops or activities. Full TanStack Query integration. Output complete code.
```

---

## PHASE 4 — Cities & Activities (Admin-Managed) (Day 4-5)

### 4.1 — Cities Backend

**Prompt to use:**
```
I am building the Cities system for Traveloop (Express + Prisma + TypeScript).

My City model: id, name, country, region, description, imageUrl, costIndex (Float), popularityScore (Float), createdAt, updatedAt.
My Activity model: id, cityId (optional FK), title, description, category (enum: CULTURE, ADVENTURE, FOOD, NATURE, SHOPPING, NIGHTLIFE, WELLNESS, HISTORY, OTHER), durationMinutes (Int), cost (Decimal), currency (String), imageUrl (optional), createdAt.

Create:

1. apps/backend/src/routes/city.routes.ts
   Public routes (no auth):
   - GET /cities — paginated, searchable (q=), filterable (country=, region=), sortable (sort=popularity|cost|name)
   - GET /cities/:id — single city with top 10 activities

   Admin routes (admin middleware):
   - POST /admin/cities — create city
   - PUT /admin/cities/:id — update city
   - DELETE /admin/cities/:id — delete (only if no trips reference it)
   - POST /admin/cities/:id/activities — add activity to city
   - PUT /admin/activities/:id — update activity
   - DELETE /admin/activities/:id — delete activity

2. apps/backend/src/services/city.service.ts
   - Full text search across name, country, region
   - getCityWithActivities: include activities grouped by category
   - Pagination with metadata
   - Validation: prevent delete if city has trip stops

3. apps/backend/src/services/activity.service.ts
   - getActivitiesByCity(cityId, filters: { category?, maxCost?, search? })
   - Activity categories as constants

4. apps/backend/src/schemas/city.schema.ts
   Full Zod validation for create/update.

5. apps/backend/src/middleware/admin.middleware.ts (if not exists)
   Check user.isAdmin === true, else 403.

Output complete, typed code.
```

### 4.2 — Cities Frontend

**Prompt to use:**
```
I am building the Cities/Destinations page for Traveloop (React + TypeScript + TailwindCSS + TanStack Query).

My API:
- GET /cities?q=&country=&sort=&page=&limit= → paginated cities
- GET /cities/:id → city detail with activities[]

City type: { id, name, country, region, description, imageUrl, costIndex, popularityScore, _count: { activities, stops } }
Activity type: { id, cityId, title, description, category, durationMinutes, cost, currency, imageUrl }

Create:

1. apps/frontend/src/hooks/useCities.ts
   - useCities(filters) — paginated, refetches on filter change
   - useCity(id) — single city with activities
   - Query keys: ["cities", filters], ["cities", id]

2. apps/frontend/src/pages/Cities.tsx (FULL REWRITE)
   Features:
   - Search bar (debounced 400ms)
   - Filter chips: by country (dropdown), by sort order (Most Popular / Lowest Cost / A-Z)
   - City card grid (3 cols desktop, 2 tablet, 1 mobile)
   - City card: image with gradient overlay, name, country, cost index badge (₹₹₹ style), activity count
   - Click card → opens CityDetailDrawer (right-side slide panel)
   - Loading: skeleton cards (6)
   - Empty state: "No destinations found. Try a different search."

3. apps/frontend/src/components/cities/CityDetailDrawer.tsx
   Right-side drawer/panel (slide in from right, Framer Motion):
   - City header: image, name, country, description
   - Activities list grouped by category
   - Each activity: title, duration, cost, category badge
   - "Add to Trip" button → opens trip selector modal (pick which trip/stop to add to)
   
4. apps/frontend/src/components/cities/AddToTripModal.tsx
   - Fetch user's trips
   - Select trip → then select or create a stop
   - Confirm adds activity to that stop via API

All data from API. No hardcoded cities or activities.
```

---

## PHASE 5 — Community System (Day 5-6)

### 5.1 — Community Backend

**Prompt to use:**
```
I am building the Community/Social system for Traveloop (Express + Prisma + TypeScript).

Models I have:
- CommunityPost: id, userId, tripId (optional), content, imageUrl, isPublic, likes, createdAt
- Friend: id, requesterId, receiverId, status (PENDING|ACCEPTED|DECLINED), createdAt
- User: has username, isPublic fields

Create:

1. apps/backend/src/routes/community.routes.ts
   - GET /community/feed — public posts + friend posts (paginated, newest first)
   - GET /community/posts/:id — single post with author info
   - POST /community/posts — create post (auth required)
   - PUT /community/posts/:id — edit post (owner only)
   - DELETE /community/posts/:id — delete (owner only)
   - POST /community/posts/:id/like — toggle like (auth required)
   - GET /community/users — discover users (public profiles)

2. apps/backend/src/routes/friend.routes.ts
   - POST /friends/request — send friend request (body: { userId })
   - PUT /friends/:requestId/accept — accept request
   - PUT /friends/:requestId/decline — decline request
   - DELETE /friends/:friendId — unfriend
   - GET /friends — my accepted friends list
   - GET /friends/requests — incoming pending requests
   - GET /friends/status/:userId — friendship status with specific user

3. apps/backend/src/services/community.service.ts
   - Feed algorithm: public posts + posts from accepted friends, paginated, sorted by createdAt desc
   - Toggle like: if user already liked → unlike, else like (track in a simple way)
   - Include author: username, avatarUrl, name

4. apps/backend/src/services/friend.service.ts
   - Prevent duplicate requests
   - Prevent self-requests
   - getFriendshipStatus: "none" | "requested_by_me" | "requested_by_them" | "friends"

Output complete TypeScript code with proper auth guards.
```

### 5.2 — Community Frontend

**Prompt to use:**
```
I am building the Community page for Traveloop (React + TypeScript + TailwindCSS + TanStack Query + Framer Motion).

Create:

1. apps/frontend/src/hooks/useCommunity.ts
   - useCommunityFeed(page) — infinite query
   - useCreatePost() — mutation
   - useToggleLike(postId) — optimistic mutation
   - useDeletePost() — mutation

2. apps/frontend/src/hooks/useFriends.ts
   - useMyFriends() 
   - useFriendRequests()
   - useSendFriendRequest() — mutation
   - useRespondToRequest(requestId) — accept/decline mutation
   - useFriendStatus(userId)

3. apps/frontend/src/pages/Community.tsx (FULL BUILD)
   Two-column layout (on desktop):
   
   Left column (main feed, 65% width):
   - Create post box at top (textarea + optional trip tag + post button)
   - Infinite scroll feed of posts
   - Post card: avatar, username, date, content, trip link (if tagged), like button with count, share button
   - Loading skeleton (3 cards)
   - Empty state

   Right column (sidebar, 35% width):
   - "Discover Travelers" section: list of public users with Follow button
   - "Friend Requests" section: incoming requests with Accept/Decline
   - My friends list (compact)

4. apps/frontend/src/components/community/PostCard.tsx
   - Full post display component
   - Like animation (heart pulse on click, Framer Motion)
   - Author: avatar (initials fallback) + username + time ago
   - If post has linked trip: show trip card snippet

5. apps/frontend/src/components/community/CreatePostModal.tsx
   - Textarea for content (max 500 chars with counter)
   - Trip selector (optional — attach to one of user's trips)
   - Image URL input (optional)
   - Post button with loading state

No hardcoded posts or users. Full API integration.
```

---

## PHASE 6 — Expense & Invoice System (Day 6-7)

### 6.1 — Expense Backend

**Prompt to use:**
```
I am building the Expense Management system for Traveloop (Express + Prisma + TypeScript).

My Expense model: id, tripId, title, amount (Decimal), currency, category (enum: FOOD|TRANSPORT|ACCOMMODATION|ACTIVITY|SHOPPING|OTHER), paidById (userId FK), createdAt.

I need expense splitting support. Approach: store splits as a separate ExpenseSplit model:
ExpenseSplit: id, expenseId, userId, amount (Decimal), isPaid (Boolean default false)

Please also add this model to the existing schema (provide the Prisma schema addition).

Create:

1. apps/backend/src/routes/expense.routes.ts
   - GET /trips/:tripId/expenses — all expenses with splits
   - POST /trips/:tripId/expenses — create expense
   - PUT /trips/:tripId/expenses/:id — update expense
   - DELETE /trips/:tripId/expenses/:id — delete expense
   - GET /trips/:tripId/expenses/summary — category breakdown + totals
   - POST /trips/:tripId/expenses/:id/split — split expense among users
   - PUT /trips/:tripId/expenses/splits/:splitId/pay — mark split as paid

2. apps/backend/src/services/expense.service.ts
   - createExpense with optional splits array: [{ userId, amount }]
   - Validate: sum of splits must equal total amount
   - getSummary: { byCategory: [{category, total, count}], totalSpent, byPerson: [{name, paid, owes}] }
   - getBalances(tripId): calculate who owes whom (simplified: direct balances, not optimized)

3. apps/backend/src/routes/invoice.routes.ts
   - GET /trips/:tripId/invoice — generate invoice data (JSON, formatted for PDF)
   Invoice data structure:
   {
     tripTitle, dateRange, travelerName, generatedAt,
     stops: [{ location, dates, activities: [{name, cost}] }],
     expenses: [{ title, category, amount, date }],
     summary: { subtotal, currency, byCategory }
   }

Output complete TypeScript code.
```

### 6.2 — Expense Frontend + PDF Invoice

**Prompt to use:**
```
I am building the Expense/Invoice page for Traveloop (React + TypeScript + TailwindCSS + TanStack Query).

For PDF generation, use the browser's window.print() with a print-specific CSS stylesheet (no external PDF library needed).

Create:

1. apps/frontend/src/hooks/useExpenses.ts
   - useExpenses(tripId)
   - useExpenseSummary(tripId)
   - useCreateExpense(tripId)
   - useDeleteExpense(tripId)
   - useInvoiceData(tripId)

2. apps/frontend/src/pages/ExpenseInvoice.tsx (FULL REWRITE)
   Two views (toggle between them):
   
   EXPENSE VIEW:
   - Summary cards: Total Spent, Budget Remaining, Expense Count
   - Pie/bar chart by category (use CSS-based bar chart, no library needed)
   - Expense list: title, category badge, amount, who paid, date, delete button
   - Add Expense button → AddExpenseModal
   - Per-person balance: "John owes Sarah ₹500"
   
   INVOICE VIEW (print-ready):
   - Professional invoice layout
   - Trip header: name, dates, traveler
   - Stops summary table
   - Full expense list table
   - Category totals
   - Grand total
   - "Download / Print" button (triggers window.print())
   - Print CSS: hide UI chrome (header, nav, buttons), show only invoice content

3. apps/frontend/src/components/expenses/AddExpenseModal.tsx
   Fields: title, amount, currency (from trip currency), category (dropdown), paidBy (user selector from trip members), date, optional split toggle.

4. apps/frontend/src/components/expenses/ExpenseCard.tsx
   Reusable card: category icon (emoji-based), title, amount formatted, payer avatar, date.

All data from API. No hardcoded expenses.
```

---

## PHASE 7 — Packing & Notes System (Day 7)

### 7.1 — Packing Backend

**Prompt to use:**
```
I am upgrading the Packing and Notes systems for Traveloop (Express + Prisma + TypeScript).

My PackingItem model: id, tripId, name, category (String), isPacked (Boolean), createdAt.
My Note model: id, tripId, stopId (optional FK to TripStop), title, content, imageUrl (optional), createdAt.

Create/update:

1. apps/backend/src/routes/packing.routes.ts
   - GET /trips/:tripId/packing — all items grouped by category
   - POST /trips/:tripId/packing — create item
   - PUT /trips/:tripId/packing/:id — update (name, category, isPacked)
   - DELETE /trips/:tripId/packing/:id — delete
   - PUT /trips/:tripId/packing/bulk-check — bulk mark as packed (body: { ids: string[], isPacked: bool })
   - DELETE /trips/:tripId/packing/packed — delete all packed items
   - GET /trips/:tripId/packing/progress — { total, packed, percentage }

2. apps/backend/src/services/packing.service.ts
   - getItemsGroupedByCategory: returns { [category]: PackingItem[] }
   - Suggested categories constant: ["Clothing", "Documents", "Electronics", "Toiletries", "Medicine", "Snacks", "Other"]
   - bulkUpdate in a single transaction

3. apps/backend/src/routes/note.routes.ts
   - GET /trips/:tripId/notes — all notes (optionally filtered by ?stopId=)
   - POST /trips/:tripId/notes — create note
   - PUT /trips/:tripId/notes/:id — update
   - DELETE /trips/:tripId/notes/:id — delete

4. apps/backend/src/services/note.service.ts
   - Ownership checks through trip
   - Validate imageUrl if provided (must be valid URL)

Output complete TypeScript code.
```

### 7.2 — Packing & Notes Frontend

**Prompt to use:**
```
I am building the Packing Checklist and Notes pages for Traveloop (React + TypeScript + TailwindCSS + TanStack Query + Framer Motion).

Create:

1. apps/frontend/src/hooks/usePacking.ts
   - usePackingList(tripId) — with progress calculation
   - useCreatePackingItem(tripId)
   - useTogglePacked(tripId) — optimistic update
   - useBulkToggle(tripId)
   - useDeletePacked(tripId)
   - usePackingProgress(tripId)

2. apps/frontend/src/pages/PackingChecklist.tsx (FULL REWRITE)
   Features:
   - Progress bar at top (X of Y items packed — animated fill)
   - Category accordion sections (Clothing, Documents, etc.)
   - Each item: checkbox (animated check Framer Motion), item name, delete button
   - Add item: inline input at bottom of each category + "New Category" button
   - Quick actions: "Check All", "Uncheck All", "Delete Packed"
   - Empty state: "Start building your packing list"
   - Skeleton while loading

3. apps/frontend/src/hooks/useNotes.ts
   - useNotes(tripId, stopId?)
   - useCreateNote(tripId)
   - useUpdateNote(tripId)
   - useDeleteNote(tripId)

4. apps/frontend/src/pages/Notes.tsx (if it exists, REWRITE; else create)
   Features:
   - Filter: All Notes / Stop-specific (dropdown of stops)
   - Note cards in masonry-like grid (CSS columns)
   - Each card: title, content preview (150 chars), image thumbnail if exists, stop tag, date, edit/delete buttons
   - Click card → full note modal
   - "Add Note" button → NoteEditor modal
   - Note editor: title input, textarea, optional image URL, optional stop selector

All data from API. Optimistic updates for toggle. Full TypeScript.
```

---

## PHASE 8 — Dashboard (Day 8)

**Prompt to use:**
```
I am building the dynamic Dashboard for Traveloop (React + TypeScript + TailwindCSS + TanStack Query + Framer Motion).

My existing APIs:
- GET /trips?status=active → active trips
- GET /trips?status=upcoming → upcoming trips
- GET /trips?status=past → past trips
- GET /users/me → user profile
- GET /community/feed?limit=3 → recent community posts
- GET /cities?sort=popularity&limit=4 → popular cities

Create:

1. apps/frontend/src/hooks/useDashboard.ts
   Parallel fetch hook using Promise.all pattern with TanStack Query:
   - Fetches: activeTrips, upcomingTrips, recentTrips (past 2), popularCities, communityHighlights
   - Single loading state across all queries
   - Returns all data + isLoading + errors

2. apps/frontend/src/pages/Dashboard.tsx (FULL REWRITE)
   Sections (in order):
   
   A) HERO — Personalized greeting
      "Good morning, {name}! Ready to plan your next adventure?"
      CTA buttons: "Plan New Trip" → /trips/new, "Explore Destinations" → /cities
   
   B) ACTIVE TRIP CARD (if any)
      Highlighted card showing current active trip:
      - Progress bar (days elapsed / total days)
      - Quick stats: stops left, budget remaining
      - "Continue Planning" button
   
   C) UPCOMING TRIPS (horizontal scroll)
      Cards with: cover image, title, days until departure badge, destination count
   
   D) POPULAR DESTINATIONS (grid 4 cards)
      City cards from API: image, name, country, activity count
      
   E) COMMUNITY HIGHLIGHTS (3 latest posts)
      Compact post cards: author avatar + name, content preview, like count
   
   F) RECENT TRIPS (2 cards)
      Past trips: cover, title, date range, expense summary
   
   Loading: Full skeleton layout matching actual content
   Empty states: if no trips yet → big CTA to create first trip
   
   All data dynamic from API. Animate sections in with staggered Framer Motion on mount.
   No hardcoded trips, cities, or posts.
```

---

## PHASE 9 — Admin Panel (Day 8-9)

**Prompt to use:**
```
I am building the Admin Panel for Traveloop (React + TypeScript + TailwindCSS + TanStack Query).

My backend admin routes:
- GET /admin/stats → { totalUsers, totalTrips, totalCities, totalPosts, newUsersThisWeek, activeTrips }
- GET /admin/users?page=&search= → paginated users with isAdmin flag
- PUT /admin/users/:id/toggle-admin → toggle admin status
- DELETE /admin/users/:id → delete user account
- POST /admin/cities → create city (already done)
- GET /admin/cities → all cities for management

First, create missing backend routes if not done:
1. apps/backend/src/routes/admin.routes.ts
   - GET /admin/stats
   - GET /admin/users (paginated + searchable)
   - PUT /admin/users/:id/toggle-admin
   - DELETE /admin/users/:id (cannot delete yourself)
   All protected by admin middleware.

2. apps/backend/src/services/admin.service.ts
   - getStats() — aggregate counts from Prisma
   - getUsers(filters) — paginated with search on name, email, username

Then create frontend:

3. apps/frontend/src/pages/AdminPanel.tsx (FULL REWRITE)
   Tabbed interface:
   
   TAB 1 — Overview
   Stat cards: Total Users, Total Trips, Total Cities, Posts, New Users (7d)
   Simple activity numbers.
   
   TAB 2 — Users
   Searchable table: avatar, name, email, username, isAdmin badge, joined date, trip count
   Actions: Toggle Admin, Delete (with confirmation modal)
   Pagination
   
   TAB 3 — Destinations  
   Cities table: image thumbnail, name, country, activity count, cost index
   Actions: Edit, Delete
   "Add City" button → form modal
   
   TAB 4 — Community
   Recent posts table: author, content preview, public/private badge, likes, date
   Action: Delete post (moderation)

Guard: redirect non-admins to /dashboard. Show "Access Denied" if not admin.
Full TypeScript. Paginated tables. Confirmation modals for destructive actions.
```

---

## PHASE 10 — Polish, Performance & Security (Day 9-10)

### 10.1 — Backend Security Hardening

**Prompt to use:**
```
I am hardening the Traveloop backend (Node.js + Express + TypeScript) for production.

Current setup:
- Express 5
- JWT auth
- Prisma + PostgreSQL
- No rate limiting currently
- No input sanitization beyond Zod

Add these security layers:

1. apps/backend/src/middleware/rateLimiter.ts
   Use express-rate-limit package.
   Create different limiters:
   - authLimiter: 10 requests per 15 minutes (for /auth routes)
   - apiLimiter: 100 requests per minute (for all other routes)
   - uploadLimiter: 20 requests per hour (for any file upload routes)

2. apps/backend/src/middleware/sanitize.ts
   - Strip HTML from all string inputs using a simple regex (no library)
   - Apply as middleware to all POST/PUT routes

3. apps/backend/app.ts (UPDATE)
   Add:
   - helmet() for security headers
   - cors({ origin: process.env.FRONTEND_URL, credentials: true })
   - express.json({ limit: "2mb" }) — limit body size
   - Apply authLimiter to /auth routes
   - Apply apiLimiter to all /api routes
   - Response time header middleware

4. apps/backend/src/middleware/validate.ts (if not exists)
   Generic Zod validation middleware:
   validate(schema) → middleware that validates req.body and calls next() or returns 400

Show the updated app.ts and each new middleware file in full.
Install commands: npm install helmet express-rate-limit
```

### 10.2 — Frontend Performance

**Prompt to use:**
```
I am optimizing the Traveloop frontend (React + TypeScript + Vite) for production performance.

Current state: All routes loaded eagerly, no code splitting, no error boundaries.

Create:

1. apps/frontend/src/router.tsx (UPDATE existing router)
   Convert all page imports to React.lazy():
   const Dashboard = lazy(() => import('./pages/Dashboard'));
   // ... all other pages
   
   Wrap all routes in Suspense with a PageLoader fallback component.

2. apps/frontend/src/components/ui/PageLoader.tsx
   Full-page loading spinner/skeleton shown during lazy load.
   Matches app's design (TailwindCSS, no external deps).

3. apps/frontend/src/components/ui/ErrorBoundary.tsx
   Class component ErrorBoundary that:
   - Catches React render errors
   - Shows friendly error card: "Something went wrong. Try refreshing."
   - Logs error to console (or error service)
   - Has "Retry" button that resets state

4. apps/frontend/src/components/ui/Skeleton.tsx
   Reusable skeleton component:
   - <Skeleton className="..." /> — single bar
   - <SkeletonCard /> — card placeholder
   - <SkeletonTable rows={5} /> — table placeholder
   Animated shimmer effect using TailwindCSS animate-pulse.

5. apps/frontend/vite.config.ts (UPDATE)
   Add:
   - Manual chunks: vendor (react, react-dom), query (tanstack), motion (framer-motion)
   - Build optimizations: minify, sourcemap false in production

Output all files with complete code.
```

---

## PHASE 11 — AI Features (Optional / Bonus, Day 10)

**Prompt to use (requires OpenAI/Anthropic API key in backend env):**
```
I am adding AI features to Traveloop (Node.js + Express + TypeScript backend).

I want to use the Anthropic Claude API (already have API key as ANTHROPIC_API_KEY in .env).
Install: npm install @anthropic-ai/sdk

Create a simple AI assistant layer:

1. apps/backend/src/services/ai.service.ts
   AiService class with methods:
   
   a) generateItinerary(params: { cities: string[], days: number, budget: number, interests: string[] })
      → Returns: { stops: [{city, days, activities: [{name, description, estimatedCost}]}], totalEstimate }
      Prompt: Ask Claude to generate a practical itinerary as JSON only.
   
   b) suggestActivities(params: { city: string, interests: string[], budget: number })
      → Returns: { activities: [{name, description, category, estimatedCost, duration}] }
   
   c) generatePackingList(params: { destinations: string[], duration: number, activities: string[] })
      → Returns: { items: [{name, category, essential: boolean}] }
   
   d) estimateBudget(params: { cities: string[], days: number, style: "budget"|"mid"|"luxury" })
      → Returns: { perDay: number, total: number, breakdown: {accommodation, food, transport, activities} }

2. apps/backend/src/routes/ai.routes.ts
   - POST /ai/generate-itinerary (auth required)
   - POST /ai/suggest-activities (auth required)  
   - POST /ai/packing-list (auth required)
   - POST /ai/estimate-budget (auth required)
   Rate limit: 10 AI requests per hour per user (use Redis or simple in-memory store).

3. apps/frontend/src/hooks/useAI.ts
   - useGenerateItinerary() — mutation, returns structured data
   - useSuggestActivities(city) — query (debounced, only when city provided)
   - useGeneratePackingList(tripId) — mutation
   - useEstimateBudget() — mutation
   All with loading states.

4. Integration points:
   - In CreateTripModal: "✨ AI Budget Estimate" button
   - In BuildItinerary: "✨ Suggest Activities" button per stop
   - In PackingChecklist: "✨ AI Suggestions" button
   
Parse all AI responses as JSON. Handle parse errors gracefully with fallback message.
```

---

## Daily Execution Checklist

### How to use each prompt:
1. Copy the exact prompt text
2. Fill in `[PASTE X HERE]` with your actual current file content
3. Paste into Claude
4. Review the output before running it
5. Run tests/smoke tests after each phase

### After each phase, verify:
```bash
# Backend — make sure server starts
cd apps/backend && npm run dev

# Frontend — make sure it compiles
cd apps/frontend && npm run build

# Database — check no migration issues
cd apps/backend && npx prisma migrate status

# API smoke test
curl http://localhost:3001/health
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/trips
```

---

## Environment Variables Reference

### Backend `.env`:
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/traveloop
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
PORT=3001
NODE_ENV=development
ANTHROPIC_API_KEY=sk-ant-...   # Phase 11 only
```

### Frontend `.env`:
```env
VITE_API_URL=http://localhost:3001/api
```

---

## Implementation Order Summary

| Phase | Feature | Est. Time | Priority |
|-------|---------|-----------|----------|
| 0 | Foundation (schema, utils, API client) | 4 hrs | CRITICAL |
| 1 | Auth & User Profile | 3 hrs | HIGH |
| 2 | Dynamic Trip CRUD | 4 hrs | HIGH |
| 3 | Itinerary Builder | 6 hrs | HIGH |
| 4 | Cities & Activities | 4 hrs | HIGH |
| 5 | Community System | 5 hrs | MEDIUM |
| 6 | Expenses & Invoice | 4 hrs | MEDIUM |
| 7 | Packing & Notes | 3 hrs | MEDIUM |
| 8 | Dashboard | 3 hrs | MEDIUM |
| 9 | Admin Panel | 3 hrs | LOW |
| 10 | Polish & Security | 3 hrs | HIGH |
| 11 | AI Features | 4 hrs | BONUS |

**Total estimated effort: ~46 hours / ~10 developer-days**

---

*Generated for Traveloop — Odoo Hackathon Edition*
