# 🧳 Traveloop — UI/UX Testing & Feature Validation Guide

> **Version:** 1.0 | **Type:** Frontend QA Checklist  
> **Based on:** Product Requirements PDF + Excalidraw Wireframes (14 Screens)  
> **Purpose:** Validate all features, identify gaps, and enforce UI/UX consistency

---

## 🎨 Design System & Theme Consistency Standards

> Before testing individual screens, validate these global standards across **every** screen.

### Color Palette (Enforce Across All Screens)
| Token | Value | Usage |
|---|---|---|
| `--color-primary` | Brand main color (e.g. teal/blue) | CTAs, active states, links |
| `--color-accent` | Highlight / warning (e.g. amber/yellow) | Budget alerts, badges |
| `--color-bg` | Page background | Consistent across all screens |
| `--color-surface` | Card / modal background | Elevated content areas |
| `--color-text-primary` | Primary text | Headings, labels |
| `--color-text-muted` | Secondary text | Descriptions, timestamps |
| `--color-danger` | Errors / destructive actions | Delete, over-budget alerts |
| `--color-success` | Positive states | Packed items, confirmed trips |

**Checklist:**
- [ ] All screens use the same CSS variable tokens (no hardcoded hex values)
- [ ] CTA button style is identical across all screens (color, border-radius, font-weight)
- [ ] Danger/destructive actions are consistently red across all screens
- [ ] Success states are consistently green (✓ packed, ✓ completed)
- [ ] "Traveloop" wordmark/logo renders identically in all navbars

### Typography
| Element | Style |
|---|---|
| App Name / H1 | Bold, brand font, largest size |
| Section headings (H2) | Semibold, 20–24px |
| Card titles (H3) | Medium, 16–18px |
| Body text | Regular, 14–16px |
| Muted / metadata | Regular, 12–14px, muted color |
| Buttons | Semibold, 14px |

**Checklist:**
- [ ] Font family is consistent across all screens (no screen uses a different font)
- [ ] Heading hierarchy is respected (H1 > H2 > H3) on every screen
- [ ] Button text is not all-caps on some screens and title-case on others

### Spacing & Layout
- [ ] Consistent padding inside cards (16px or 24px — pick one)
- [ ] Consistent gap between list items / cards
- [ ] Consistent navbar height across all screens
- [ ] Consistent page-level horizontal padding (left/right gutters)
- [ ] Responsive: screens adapt correctly from mobile → tablet → desktop

### Navigation / Navbar
- [ ] "Traveloop" brand name appears top-left on every screen
- [ ] Global navigation (Home, My Trips, Community, Profile) is present on all authenticated screens
- [ ] Active nav item is visually highlighted (underline, color, or bold)
- [ ] Search icon / bell icon in top-right (if present in wireframe) is consistent
- [ ] Back button / breadcrumb present on all inner screens

---

## 📋 Screen-by-Screen Feature Validation

---

### Screen 1 — Login Screen

**Wireframe Label:** Login Screen (Screen 1)

#### Required Components
- [ ] Circular profile photo placeholder (avatar area)
- [ ] Username / Email input field
- [ ] Password input field (masked by default)
- [ ] "Login Button" — primary CTA
- [ ] Link to Registration / Signup screen
- [ ] "Forgot Password" link
- [ ] Basic inline validation (empty fields, invalid email format)

#### UX Checks
- [ ] Password field has a show/hide toggle (eye icon)
- [ ] "Login" button is disabled until both fields have input
- [ ] Error state shown clearly below the field (not just an alert)
- [ ] Pressing Enter submits the form
- [ ] Loading/spinner state on the button while authenticating
- [ ] No broken layout on small screens (mobile viewport)

#### Missing / Gap Check
- [ ] "Forgot Password" flow — does it navigate to a reset screen or open a modal?
- [ ] Social login (Google/Apple) — **not in requirements; skip unless added by team**
- [ ] "Stay logged in" / Remember Me checkbox — mark as **optional enhancement**

---

### Screen 2 — Registration Screen

**Wireframe Label:** Registration Screen (Screen 2)

#### Required Components
- [ ] Circular photo upload area (profile picture)
- [ ] First Name field
- [ ] Last Name field
- [ ] Email Address field
- [ ] Phone Number field
- [ ] City field
- [ ] Country field (dropdown preferred)
- [ ] Additional Information textarea
- [ ] "Register User" / Submit button

#### UX Checks
- [ ] All required fields have visible required indicators (*)
- [ ] Email format validation (real-time or on submit)
- [ ] Phone number accepts international format
- [ ] Country field is a searchable dropdown (not free text)
- [ ] Photo upload shows a preview after selection
- [ ] Form preserves data if validation fails (no full reset)
- [ ] Success state: navigates to Dashboard or shows success message

#### Missing / Gap Check
- [ ] Password + Confirm Password fields — **MISSING from wireframe but required for account creation** → Add two password fields with strength indicator
- [ ] Terms & Conditions checkbox — **should be present before registration**

---

### Screen 3 — Main Landing Page / Dashboard (Home Screen)

**Wireframe Label:** Main Landing Page (Screen 3)

#### Required Components
- [ ] Traveloop brand name in top navbar
- [ ] Search / filter bar
- [ ] "Group by" / "Filter" / "Sort by" controls
- [ ] Large banner image / hero section
- [ ] "Top Regional Selections" section with destination cards (4 cards minimum)
- [ ] "Previous Trips" section with trip cards (at least 2 cards)
- [ ] "Plan a Trip" button (floating or fixed CTA)
- [ ] Recommended destinations grid

#### UX Checks
- [ ] Banner image has a loading skeleton, not broken image placeholder
- [ ] Top Regional Selections cards are clickable and navigate to City detail/search
- [ ] Previous Trips cards show: trip name, date range, destination count
- [ ] "Plan a Trip" button navigates to Create Trip screen (Screen 4)
- [ ] Page loads with welcome message (e.g. "Hello, [Name]")
- [ ] Empty state shown if user has no previous trips (not blank)

#### Missing / Gap Check
- [ ] Budget highlights/summary widget — **per requirements** → Add a small budget overview card ("Your total planned spend: ₹X,XXX")
- [ ] Recommended destinations — should these be curated or based on user's history? Document the decision.

---

### Screen 4 — Create a New Trip Screen

**Wireframe Label:** Create a new Trip (Screen 4)

#### Required Components
- [ ] "Plan a new trip" section header
- [ ] Trip Name / Title field
- [ ] Select a Place / Destination field
- [ ] Start Date picker
- [ ] End Date picker
- [ ] "Suggestion for Places to Visit / Activities to perform" section (grid of suggestion cards — 3×2)
- [ ] Save / Create Trip CTA button

#### UX Checks
- [ ] Date pickers enforce: Start Date < End Date
- [ ] Place field is a searchable dropdown (connects to city search)
- [ ] Suggestion cards are clickable and auto-populate the destination
- [ ] Trip Name has character limit with a counter (e.g. 50/100)
- [ ] Validation: all required fields must be filled before saving
- [ ] After save, user is navigated to Itinerary Builder (Screen 5) for that trip

#### Missing / Gap Check
- [ ] Trip description field — **per requirements** → Add a multiline description/notes field
- [ ] Cover photo upload (optional) — **per requirements** → Add optional image upload with preview
- [ ] Trip Name autosaves to draft after 3 seconds of inactivity (nice-to-have)

---

### Screen 5 — Build Itinerary Screen (Itinerary Builder)

**Wireframe Label:** Build Itinerary Screen (Screen 5)

#### Required Components
- [ ] Section 1, Section 2, Section 3 blocks (each representing a stop/day)
- [ ] Each section contains: title/description text area, date range (xxx to yyy), budget for that section
- [ ] "Date Range: xxx to yyy" display per section
- [ ] "Budget of this section" field/display per section
- [ ] "+ Add another Section" button at the bottom

#### UX Checks
- [ ] Sections can be reordered (drag-and-drop or up/down arrows)
- [ ] Each section can be independently collapsed/expanded
- [ ] "Add another Section" dynamically adds a new blank section
- [ ] Sections can be deleted (with a confirm dialog)
- [ ] Budget fields accept numeric input only
- [ ] Changes auto-save or a "Save Itinerary" button is visible

#### Missing / Gap Check
- [ ] "Add Stop" button with city selector — **per requirements** → Each section should have a city/place picker
- [ ] Activity assignment per stop — **per requirements** → Each section should allow adding activities from Activity Search (Screen 8)
- [ ] Section labels should reflect the city name once selected

---

### Screen 6 — User Trip Listing Screen (My Trips)

**Wireframe Label:** User Trip Listing (Screen 6)

#### Required Components
- [ ] Search bar at top
- [ ] "Group by" / "Filter" / "Sort by" controls
- [ ] **"Ongoing"** section with trip cards
- [ ] **"Upcoming"** section with trip cards
- [ ] **"Completed"** section with trip cards
- [ ] Each card shows: "Short Overview of the Trip" (name, dates, key destination)

#### UX Checks
- [ ] Each trip card is clickable and navigates to Itinerary View (Screen 9)
- [ ] Each trip card has Edit / View / Delete action buttons or a 3-dot menu
- [ ] Filter works across all three sections simultaneously
- [ ] Sort by: Date, Name, Budget — all functional
- [ ] Empty state per section (e.g., "No upcoming trips — plan one!")
- [ ] Status badges (Ongoing / Upcoming / Completed) are color-coded consistently

#### Missing / Gap Check
- [ ] Destination count shown on each card — **per requirements** (e.g., "3 cities")
- [ ] Date range shown on each card — **per requirements**

---

### Screen 7 — User Profile Pages

**Wireframe Label:** User Profile Pages (Screen 7)

#### Required Components
- [ ] Circular "Image of the User" placeholder with edit option
- [ ] "User Details with appropriate option to edit those information" area
- [ ] **"Preplanned Trips"** section: cards with "View" buttons (3 cards)
- [ ] **"Previous Trips"** section: cards with "View" buttons (3 cards)
- [ ] Edit profile fields: Name, Photo, Email

#### UX Checks
- [ ] Profile photo upload with crop/preview
- [ ] "Edit" mode toggled by a button (not always in edit mode)
- [ ] "View" buttons on trip cards navigate correctly
- [ ] Language preference dropdown (per requirements)
- [ ] Saved destinations list (per requirements)
- [ ] Delete account option (with double-confirm dialog)

#### Missing / Gap Check
- [ ] Language preference setting — **per requirements** → Add a language dropdown in settings area
- [ ] Saved/Wishlist destinations list — **per requirements** → Add a "Saved Places" subsection
- [ ] Privacy settings toggle (public/private profile) — **recommended addition**
- [ ] Delete account button — **per requirements, must be present** with a destructive-style confirm modal

---

### Screen 8 — Activity Search / City Search Page

**Wireframe Label:** Activity Search Pages / City Search Page (Screen 8)

#### Required Components
- [ ] "Paragliding" style search bar (pre-filled search term example)
- [ ] "Group by" / "Filter" / "Sort by" controls
- [ ] "Results" label
- [ ] List of result items — each item card shows: "Option and its details" (name + detail)
- [ ] Minimum 7 visible result rows in wireframe

#### UX Checks
- [ ] Search is real-time (results update as user types)
- [ ] Filter options: by type (activity/city), cost range, duration
- [ ] Each result card has an "Add to Trip" button
- [ ] Clicking a result card opens a detail view (description, images, cost)
- [ ] Empty state when no results match
- [ ] Loading skeleton while results are being fetched

#### Missing / Gap Check  
- [ ] Filter by country/region — **per requirements for City Search**
- [ ] City cards show: country, cost index, popularity — **per requirements**
- [ ] Activity cards show: type, cost, duration — **per requirements**
- [ ] "Add to Trip" button must connect to the active/selected trip

---

### Screen 9 — Itinerary View Screen with Budget Section

**Wireframe Label:** Itinerary View Screen with budget section (Screen 9)

#### Required Components
- [ ] "Itinerary for a selected place" title
- [ ] Table/list with columns: Physical Activity | Expense
- [ ] **Day 1** grouping with activity rows and expense values
- [ ] **Day 2** grouping with activity rows and expense values
- [ ] Day-wise expandable/collapsible sections
- [ ] Total expense summary

#### UX Checks
- [ ] City headers are visually prominent (e.g., bold, colored background)
- [ ] Activity blocks show: name, time, cost
- [ ] View mode toggle: Calendar view / List view — both functional
- [ ] Expenses are summed per day and shown as a day total
- [ ] Grand total shown at bottom of the itinerary
- [ ] "Edit Itinerary" button accessible from this screen
- [ ] Share button (public URL generation) — connects to Screen 11

#### Missing / Gap Check
- [ ] Budget section / sidebar — **per requirements** → Add a collapsible budget summary panel
- [ ] Calendar view mode — **per requirements** → Add a date-based calendar layout toggle
- [ ] "Download as PDF" option — **recommended for sharing**

---

### Screen 10 — Community Tab Screen

**Wireframe Label:** Community tab Screen (Screen 10)

#### Required Components
- [ ] "Community Tab" section heading
- [ ] Search / Filter / Sort controls
- [ ] Feed of community posts (at least 4 post cards with circular avatar)
- [ ] Each card: user avatar, trip summary, content snippet
- [ ] Sidebar note: "Community section where all the users can share their experiences about a certain trip or activity. Using the search, group or filter and sorting option, the user can narrow down the key result they're looking for."

#### UX Checks
- [ ] Posts are sorted by: Most Recent, Most Liked, Most Saved (per sort option)
- [ ] Each post links to the public itinerary (Screen 11)
- [ ] "Copy Trip" or "Save Trip" action on each community card
- [ ] Filter by: destination, activity type, trip duration
- [ ] Pagination or infinite scroll (not just 4 hardcoded cards)
- [ ] Users can post their own trip to Community from Itinerary View

#### Missing / Gap Check
- [ ] Social interaction (Like / Comment / Save) — **add at minimum a Save/bookmark button**
- [ ] "Share to Community" toggle from itinerary view — must be connected

---

### Screen 11 — Shared / Public Itinerary View

> **Note:** This maps to the wireframe's Community posts linking to a public itinerary URL.

#### Required Components
- [ ] Public-facing, read-only itinerary view
- [ ] Itinerary summary (destination, dates, activities listed)
- [ ] "Copy Trip" button (duplicates itinerary to viewer's account)
- [ ] Social media sharing buttons (WhatsApp, Instagram link, copy URL)
- [ ] Read-only mode enforced (no Edit buttons visible)

#### UX Checks
- [ ] Public URL works without login (accessible to non-registered users)
- [ ] "Copy Trip" requires login — if not logged in, prompt login first
- [ ] Meta preview (og:title, og:image) for link sharing on social platforms
- [ ] Trip owner is credited (avatar + name shown)

#### Missing / Gap Check
- [ ] Public URL generation mechanism — **per requirements** → Add a "Share" button in Itinerary View that generates a public link
- [ ] View counter ("Viewed 128 times") — **optional but recommended**

---

### Screen 12 — Admin Panel Screen

**Wireframe Label:** Admin Panel Screen (Screen 12)

#### Required Components
- [ ] Admin-only access guard (redirect non-admins)
- [ ] Tables list: "Group Items" | "Popular Items" | "Popular Activities" | "User Trends will add"
- [ ] Charts: Pie chart + Bar chart + Line chart with data points
- [ ] User management section

#### UX Checks
- [ ] Charts render correctly with real or mock data
- [ ] Tables have pagination
- [ ] Data refreshes on page load (or has a "Refresh" button)
- [ ] Admin cannot delete their own account from this panel
- [ ] All chart values are labeled (axis labels, legend)

#### Missing / Gap Check
- [ ] Top cities / activities table — **per requirements** → Add sortable table for most-booked cities and activities
- [ ] User engagement stats — **per requirements** → Add metrics: DAU, trips created today, avg trip duration
- [ ] User management tools — **per requirements** → Add ability to view/disable user accounts

---

### Screen 13 — Trip Notes / Journal Screen

**Wireframe Label:** Trip notes or journal screen (Screen 13)

#### Required Components
- [ ] Search bar at top
- [ ] "Trip notes" section heading
- [ ] Filter: All | By Day | By Stop tabs
- [ ] Note cards, each with: title, tag (e.g. Hotel check-in details, Photo stop), toggle switch
- [ ] "+ Add Note" button
- [ ] Each note: timestamp display, content preview

#### UX Checks
- [ ] Notes are tied to a specific trip (not global)
- [ ] Add/Edit/Delete note actions all functional
- [ ] "By Day" filter shows notes sorted by trip day
- [ ] "By Stop" filter groups notes under city/stop names
- [ ] Toggle switch on notes — what does it toggle? (Pinned? Done?) → **Define and implement**
- [ ] Notes saved on blur (auto-save) or via explicit Save button

#### Missing / Gap Check
- [ ] Timestamp display on each note — **per requirements** → Must show created/updated time
- [ ] Notes list sorted by date (newest first by default) — **per requirements**
- [ ] Note categories: hotel check-in, flight details, local contacts — **per requirements (implied)**
- [ ] Edit note inline — **must be present**

---

### Screen 14 — Expense Invoice / Billing Screen

**Wireframe Label:** Expense Invoice / billing screen (Screen 14)

#### Required Components
- [ ] Back to My Trips navigation link
- [ ] Trip header: Trip name, destination (e.g. "Trip to Himalayas"), trip dates
- [ ] Finance Details: Payment status | Pending
- [ ] Expense type icons (hotel, airplane, etc.)
- [ ] Data table with columns: # | Category | Description | Quantity/Nights | Unit Cost | Amount
- [ ] Sample rows: Hotel (hotel booking, N nights), Travel (flight bookings), etc.
- [ ] **Budget Donut chart** (right panel): Total Budget, Spent, Remaining
- [ ] Row totals: Subtotal, Tax, Grand Total
- [ ] Action buttons: Download Invoice | Export as PDF | Mark as Paid

#### UX Checks
- [ ] Table rows are editable (inline edit for Description, Quantity, Cost)
- [ ] Adding a new expense row works ("+" row)
- [ ] Subtotal, Tax, Grand Total recalculate automatically when rows change
- [ ] Donut chart updates dynamically when expenses change
- [ ] "Export as PDF" generates a print-quality invoice
- [ ] "Mark as Paid" changes payment status badge from Pending → Paid
- [ ] Over-budget alert shown if Spent > Total Budget

#### Missing / Gap Check
- [ ] Cost breakdown by transport, stay, activities, meals — **per requirements** → Categories must map to these four buckets
- [ ] Pie/bar charts — **per requirements** → In addition to donut, add a bar chart breakdown by category
- [ ] Average cost per day — **per requirements** → Show "Avg per day: ₹X,XXX" metric
- [ ] Alerts for over-budget days — **per requirements** → Highlight rows/days that exceed the day budget

---

## 🔴 Missing Features Summary (Gaps Found vs Requirements)

The following features are **specified in the requirements PDF** but may not be present in the current build. Each should be added **without modifying existing functionality**.

| # | Missing Feature | Required In | Priority |
|---|---|---|---|
| 1 | Password + Confirm Password fields on Registration | Screen 2 | 🔴 Critical |
| 2 | Terms & Conditions checkbox on Registration | Screen 2 | 🔴 Critical |
| 3 | Budget highlights widget on Dashboard | Screen 3 | 🟡 Medium |
| 4 | Trip description field on Create Trip | Screen 4 | 🟡 Medium |
| 5 | Cover photo upload on Create Trip | Screen 4 | 🟢 Low |
| 6 | City/place picker per itinerary section | Screen 5 | 🔴 Critical |
| 7 | Activity assignment per stop in Itinerary Builder | Screen 5 | 🔴 Critical |
| 8 | Destination count + date range on Trip cards | Screen 6 | 🟡 Medium |
| 9 | Language preference setting in Profile | Screen 7 | 🟡 Medium |
| 10 | Saved destinations list in Profile | Screen 7 | 🟡 Medium |
| 11 | Delete account with confirm modal | Screen 7 | 🔴 Critical |
| 12 | Country/region filter in City Search | Screen 8 | 🟡 Medium |
| 13 | City cards showing cost index + popularity | Screen 8 | 🟡 Medium |
| 14 | Budget summary panel in Itinerary View | Screen 9 | 🔴 Critical |
| 15 | Calendar view toggle in Itinerary View | Screen 9 | 🟡 Medium |
| 16 | "Share to Community" toggle from Itinerary | Screen 10/11 | 🔴 Critical |
| 17 | Public URL / shareable link generation | Screen 11 | 🔴 Critical |
| 18 | Copy Trip from public view | Screen 11 | 🔴 Critical |
| 19 | User management tools in Admin panel | Screen 12 | 🟡 Medium |
| 20 | Notes timestamp display | Screen 13 | 🟡 Medium |
| 21 | Average cost per day metric | Screen 14 | 🟡 Medium |
| 22 | Over-budget day alerts | Screen 14 | 🟡 Medium |
| 23 | Category breakdown (transport/stay/activities/meals) | Screen 14 | 🔴 Critical |

---

## 🧪 Cross-Screen Functional Flow Tests

These test end-to-end flows across multiple screens:

### Flow 1: New User Registration → First Trip
1. [ ] Open app → lands on Login (Screen 1)
2. [ ] Click "Sign Up" → Registration (Screen 2) loads correctly
3. [ ] Fill all fields → Submit → Dashboard (Screen 3) loads
4. [ ] Click "Plan a Trip" → Create Trip (Screen 4) opens
5. [ ] Fill trip details → Save → Itinerary Builder (Screen 5) opens for that trip
6. [ ] Add sections / stops → Save → Itinerary View (Screen 9) shows the plan

### Flow 2: Search & Add Activity to Itinerary
1. [ ] From Itinerary Builder (Screen 5) → click "Add Activity" on a section
2. [ ] Activity Search (Screen 8) opens
3. [ ] Search for an activity → filter by type → click result
4. [ ] "Add to Trip" adds it to the correct section
5. [ ] Budget section in Screen 14 reflects the new activity cost

### Flow 3: Share a Trip to Community
1. [ ] Open any trip in Itinerary View (Screen 9)
2. [ ] Click "Share" → generates public URL
3. [ ] Toggle "Share to Community" → post appears in Community Tab (Screen 10)
4. [ ] Another user opens Community Tab → sees the post
5. [ ] Clicks post → Public Itinerary View (Screen 11) opens
6. [ ] Clicks "Copy Trip" → trip duplicated to their My Trips (Screen 6)

### Flow 4: Packing Checklist → Trip Completion
1. [ ] Open a trip → navigate to Packing Checklist (Screen 11)
2. [ ] Add items across categories: clothing, documents, electronics
3. [ ] Check off items one by one
4. [ ] Progress indicator updates (e.g. "8/12 packed")
5. [ ] "Reset Checklist" clears all checked states

### Flow 5: Budget Invoice & Export
1. [ ] Open a completed trip → Expense Invoice (Screen 14)
2. [ ] Verify all categories: Hotel, Travel, Activities, Meals
3. [ ] Edit a row (change quantity/cost) → totals recalculate
4. [ ] Donut chart updates to reflect new totals
5. [ ] Click "Export as PDF" → PDF downloads correctly
6. [ ] Click "Mark as Paid" → status badge changes

---

## 🎨 UI Consistency Improvements (Design Uplift)

> Apply these improvements **without changing existing functionality**. They are purely visual and UX polish fixes.

### 1. Navbar / Header
- [ ] Add a subtle box-shadow or border-bottom to distinguish navbar from content
- [ ] Animate the active nav indicator (slide underline, not just color change)
- [ ] Add user avatar to top-right corner (all authenticated screens)

### 2. Cards (Trip, Destination, Activity)
- [ ] All cards should have consistent: border-radius (12px), shadow, hover state (lift effect)
- [ ] Add hover transition: `transform: translateY(-2px)` with `box-shadow` increase
- [ ] Image placeholder should be a gradient (not broken img icon)
- [ ] Tags/badges (Ongoing, Completed, Upcoming) should be pill-shaped with color coding

### 3. Buttons
- [ ] Primary CTA: filled, brand color, 8px border-radius, semibold text
- [ ] Secondary: outlined, same border-radius
- [ ] Destructive: red/danger color with ⚠️ icon where appropriate
- [ ] Loading state on all async buttons (spinner inside button)
- [ ] Disabled state clearly styled (opacity: 0.5, cursor: not-allowed)

### 4. Forms & Inputs
- [ ] All inputs: same height (44px), same border-radius (8px), same focus ring color
- [ ] Label always above the input (not inside as placeholder only)
- [ ] Error state: red border + red error message below field
- [ ] Success state: green check icon inside the field

### 5. Empty States
Every section/screen that can have no data must show a designed empty state:
- [ ] Illustration or icon (not just text)
- [ ] Short description ("No trips yet")
- [ ] CTA button ("Plan your first trip →")

### 6. Loading States
- [ ] All data-fetching screens have skeleton loaders (not spinners)
- [ ] Skeleton matches the shape of the actual content (card skeletons, not generic grey bars)

### 7. Toast Notifications
- [ ] Success toast: green, top-right, auto-dismiss after 3s
- [ ] Error toast: red, stays until dismissed
- [ ] Consistent position across all screens (always top-right or always bottom-center — not both)

### 8. Modals & Dialogs
- [ ] All modals have: backdrop overlay, centered positioning, close button (×), keyboard-dismissible (Esc)
- [ ] Destructive confirm modals have a red "Confirm Delete" button and a Cancel button

---

## ✅ Final Sign-off Checklist

Before marking the frontend as complete, all of the following must pass:

- [ ] All 14 screens are implemented and navigable
- [ ] No screen shows placeholder text ("Lorem ipsum", "Option and its details") in production
- [ ] All 23 missing features from the gap table above are addressed
- [ ] All 5 cross-screen flow tests pass end-to-end
- [ ] Design system tokens are defined and applied globally
- [ ] Mobile viewport (375px) renders all screens without horizontal scroll
- [ ] No console errors on any screen
- [ ] All buttons have accessible `aria-label` or visible text
- [ ] Color contrast ratio meets WCAG AA (4.5:1 for body text)
- [ ] All forms prevent default submit and handle async correctly

---

*Generated for Traveloop Hackathon Team | Frontend QA Guide v1.0*
