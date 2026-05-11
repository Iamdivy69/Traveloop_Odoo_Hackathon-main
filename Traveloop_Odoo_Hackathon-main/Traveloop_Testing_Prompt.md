# Traveloop — UI/UX Testing Prompt
## (Give this to a tester, AI reviewer, or use it yourself)

---

## CONTEXT

You are performing a comprehensive UI/UX audit of **Traveloop**, a personalized travel planning web application. The platform has **14 screens** as defined in the product requirements. Your goal is to:

1. **Validate** that all required features exist and work correctly
2. **Identify** any missing features or broken flows
3. **Assess** the visual consistency of the entire UI
4. **Suggest** specific improvements without breaking existing functionality

The expected screens are:
- Screen 1: Login
- Screen 2: Registration
- Screen 3: Dashboard / Home (Main Landing Page)
- Screen 4: Create New Trip
- Screen 5: Build Itinerary (Itinerary Builder)
- Screen 6: My Trips / User Trip Listing
- Screen 7: User Profile
- Screen 8: Activity Search / City Search
- Screen 9: Itinerary View (with budget section)
- Screen 10: Community Tab
- Screen 11: Shared / Public Itinerary View
- Screen 12: Admin Panel / Analytics Dashboard
- Screen 13: Trip Notes / Journal
- Screen 14: Expense Invoice / Billing

---

## TESTING INSTRUCTIONS

### STEP 1 — GLOBAL CONSISTENCY AUDIT

Before testing any individual screen, evaluate the following across the **entire application**:

```
DESIGN SYSTEM CHECKS:
□ Is the same font family used on every screen?
□ Is the same color palette (primary, accent, danger, success) used consistently?
□ Are all CTA (Call-To-Action) buttons the same size, shape, and color?
□ Are all input fields the same height, border-radius, and focus style?
□ Is the navbar/header identical across all authenticated screens?
□ Is the brand name "Traveloop" displayed the same way everywhere?
□ Are card components (trip cards, destination cards) visually identical in style?
□ Are spacing/padding values consistent (not 8px on one card, 24px on another)?
□ Are loading states (skeleton loaders / spinners) used consistently?
□ Are toast/snackbar notifications positioned consistently?
```

**For each inconsistency found, report:**
- Which screen(s) are affected
- What the inconsistency is
- What it should look like to match the rest

---

### STEP 2 — SCREEN-BY-SCREEN FEATURE AUDIT

For each screen below, navigate to it and answer every question. Use ✅ PASS, ❌ FAIL, or ⚠️ PARTIAL.

---

#### SCREEN 1 — LOGIN

```
□ Is there a username/email input field?
□ Is there a password input field (text is masked)?
□ Is there a "Login" button?
□ Is there a link/button to navigate to Registration?
□ Is there a "Forgot Password" option?
□ Does the form validate empty fields before submitting?
□ Is there inline validation (error shown near the field, not in an alert popup)?
□ Does the password field have a show/hide toggle?
□ Is the button disabled when fields are empty?
□ Does the button show a loading state during login?

NAVIGATION CHECK:
□ After successful login → does it go to Dashboard (Screen 3)?
□ Clicking "Sign Up" → does it go to Registration (Screen 2)?
□ "Forgot Password" → does it trigger a reset flow?
```

---

#### SCREEN 2 — REGISTRATION

```
□ Is there a profile photo upload area?
□ Is there a First Name field?
□ Is there a Last Name field?
□ Is there an Email Address field?
□ Is there a Phone Number field?
□ Is there a City field?
□ Is there a Country field (ideally a dropdown)?
□ Is there an "Additional Information" textarea?
□ Is there a Password field?              ← CRITICAL: May be missing
□ Is there a Confirm Password field?      ← CRITICAL: May be missing
□ Is there a Terms & Conditions checkbox? ← May be missing
□ Is there a "Register User" / Submit button?
□ Does email validation work in real-time?
□ Does the form show errors per field (not a global error)?
□ After successful registration → does it navigate to Dashboard?
```

---

#### SCREEN 3 — DASHBOARD / HOME

```
□ Is there a banner/hero image section?
□ Is there a "Top Regional Selections" / destination cards section?
□ Are destination cards clickable?
□ Is there a "Previous Trips" section?
□ Is there a "Plan a Trip" / "Plan New Trip" CTA button?
□ Does the "Plan a Trip" button navigate to Create Trip (Screen 4)?
□ Is there a search bar?
□ Is there a welcome message with the user's name?
□ Is there a budget highlights widget or summary?  ← May be missing
□ Is there an empty state if the user has no trips yet?

NAVIGATION CHECK:
□ Do destination cards navigate to City/Activity Search (Screen 8)?
□ Do previous trip cards navigate to Itinerary View (Screen 9)?
```

---

#### SCREEN 4 — CREATE NEW TRIP

```
□ Is there a Trip Name / Title input?
□ Is there a destination / Place selector?
□ Is there a Start Date picker?
□ Is there an End Date picker?
□ Does the date picker enforce Start < End?
□ Is there a trip description / notes field?     ← May be missing
□ Is there a cover photo upload option?          ← May be missing
□ Is there a grid of suggested places/activities?
□ Are the suggestion cards clickable?
□ Is there a Save / Create Trip button?
□ Does it validate all required fields before saving?

NAVIGATION CHECK:
□ After saving → does it go to Itinerary Builder (Screen 5)?
□ Suggestion card clicked → does it populate the destination field?
```

---

#### SCREEN 5 — ITINERARY BUILDER

```
□ Are there itinerary sections/stops listed?
□ Does each section have a title/description field?
□ Does each section have a date range display?
□ Does each section have a budget field?
□ Is there an "+ Add another Section" button?
□ Does clicking "+ Add Section" dynamically add a new section?
□ Can sections be reordered?
□ Can sections be deleted?
□ Does each section have a city/place picker?       ← May be missing
□ Can activities be assigned to each section?       ← May be missing
□ Are changes saved (auto-save or manual Save button)?

NAVIGATION CHECK:
□ Clicking "Add Activity" → does it open Activity Search (Screen 8)?
□ Activity added from Search → does it appear in the correct section?
```

---

#### SCREEN 6 — MY TRIPS (TRIP LISTING)

```
□ Are trips grouped into: Ongoing, Upcoming, Completed?
□ Does each group have trip cards?
□ Does each card show the trip name?
□ Does each card show the date range?           ← May be missing
□ Does each card show the destination count?    ← May be missing
□ Does each card have View / Edit / Delete actions?
□ Is there a search bar that filters trips?
□ Are there Group by / Filter / Sort by controls?
□ Is there an empty state when a section has no trips?
□ Do status badges (Ongoing/Upcoming/Completed) have different colors?

NAVIGATION CHECK:
□ Clicking a trip card → navigates to Itinerary View (Screen 9)?
□ Edit → navigates to Itinerary Builder (Screen 5)?
□ Delete → shows a confirm dialog before deleting?
```

---

#### SCREEN 7 — USER PROFILE

```
□ Is the user's profile photo displayed?
□ Is there an option to change the profile photo?
□ Are editable fields present: Name, Email?
□ Is there a language preference setting?      ← May be missing
□ Is there a saved destinations list?          ← May be missing
□ Are preplanned trips shown with "View" buttons?
□ Are previous trips shown with "View" buttons?
□ Is there a "Delete Account" option?          ← Critical: May be missing
□ Does "Delete Account" show a confirmation dialog?
□ Is edit mode toggled by a button (not always editable)?
```

---

#### SCREEN 8 — ACTIVITY / CITY SEARCH

```
□ Is there a search bar?
□ Do results appear as the user types?
□ Does each result card show the name and details?
□ Is there an "Add to Trip" button on each result?
□ Are there filter controls (type, cost, duration)?
□ Is there a filter by country/region for City Search?    ← May be missing
□ Do City cards show: country, cost index, popularity?   ← May be missing
□ Do Activity cards show: type, cost, duration?          ← May be missing
□ Is there a loading skeleton while results load?
□ Is there an empty state when no results are found?

NAVIGATION CHECK:
□ "Add to Trip" → adds the item to the active/selected trip section?
□ Clicking a result card → shows a detail view with description?
```

---

#### SCREEN 9 — ITINERARY VIEW (WITH BUDGET)

```
□ Is the trip title / destination shown at the top?
□ Are activities listed grouped by Day?
□ Does each activity show: name, time, cost?
□ Are day-wise expense totals shown?
□ Is there a grand total at the bottom?
□ Is there a budget summary panel / sidebar?    ← May be missing
□ Is there a Calendar / List view toggle?      ← May be missing
□ Is there an "Edit Itinerary" button?
□ Is there a "Share" button that generates a public link?   ← Critical

NAVIGATION CHECK:
□ "Edit" → navigates to Itinerary Builder (Screen 5)?
□ "Share" → generates a public URL?
□ "Share to Community" → posts to Community Tab (Screen 10)?
```

---

#### SCREEN 10 — COMMUNITY TAB

```
□ Is there a "Community" heading?
□ Are community posts/cards shown in a feed?
□ Does each post show: user avatar, trip summary, content?
□ Is there a search bar to filter posts?
□ Are there Filter and Sort options?
□ Can posts be sorted by: Most Recent, Most Liked?
□ Is there a "Save" / bookmark action on posts?
□ Is there an empty state if no posts exist?
□ Can users post their own trip from the Itinerary View?   ← Check flow

NAVIGATION CHECK:
□ Clicking a post → opens the Public Itinerary View (Screen 11)?
```

---

#### SCREEN 11 — PUBLIC / SHARED ITINERARY VIEW

```
□ Is the itinerary displayed in read-only mode?
□ Are there no Edit buttons visible?
□ Is the trip owner's name/avatar shown?
□ Is there a "Copy Trip" button?
□ Are social media sharing options available?
□ Does the public URL work without being logged in?
□ "Copy Trip" when not logged in → prompts login first?
□ Does "Copy Trip" successfully duplicate the trip to My Trips?
```

---

#### SCREEN 12 — ADMIN PANEL

```
□ Is admin access protected (non-admins redirected)?
□ Are there data tables with trip/user information?
□ Are there charts (pie, bar, line)?
□ Do charts render correctly with data?
□ Is there a top cities/activities table?       ← May be missing
□ Is there user engagement stats display?      ← May be missing
□ Is there a user management section?          ← May be missing
□ Does pagination work on tables?
□ Is there a data refresh mechanism?
```

---

#### SCREEN 13 — TRIP NOTES / JOURNAL

```
□ Are notes listed for the current trip?
□ Is there a filter: All | By Day | By Stop?
□ Does each note show a timestamp?            ← May be missing
□ Is there an "+ Add Note" button?
□ Can notes be edited inline?
□ Can notes be deleted (with confirmation)?
□ Are notes associated with a specific trip?
□ Is the list sorted by date (newest first)?  ← May be missing
□ Is there an empty state when no notes exist?
□ Is there a search bar for notes?
```

---

#### SCREEN 14 — EXPENSE INVOICE / BILLING

```
□ Is the trip name and destination shown in the header?
□ Is there a payment status indicator (Pending / Paid)?
□ Is there a data table with: Category, Description, Quantity, Unit Cost, Amount?
□ Are the four expense categories covered: Hotel, Travel, Activities, Meals?   ← Critical
□ Is there a Subtotal, Tax, and Grand Total row?
□ Does editing a row update the totals automatically?
□ Is there a budget donut chart (Total/Spent/Remaining)?
□ Is there a bar chart breakdown by category?   ← May be missing
□ Is there an "Average cost per day" metric?   ← May be missing
□ Is there an over-budget alert / indicator?   ← May be missing
□ Is there a "Download Invoice" / "Export as PDF" button?
□ Is there a "Mark as Paid" button?
□ Does "Mark as Paid" change the status badge?
```

---

### STEP 3 — CROSS-SCREEN FLOW TESTS

Test each complete user journey end-to-end:

```
FLOW A: Registration → First Trip Creation
1. Register a new account
2. Land on Dashboard
3. Click "Plan a Trip"
4. Create a trip with name, dates, destination
5. Build itinerary with 2 sections
6. View the itinerary

EXPECTED: Each step navigates correctly, data persists through all screens

---

FLOW B: Activity Search → Add to Itinerary → See in Budget
1. Open Itinerary Builder for a trip
2. Click "Add Activity" on a section
3. Search for "Paragliding" in Activity Search
4. Click "Add to Trip"
5. Open Expense Invoice for that trip

EXPECTED: The activity appears in the correct section AND in the expense table

---

FLOW C: Share Trip to Community
1. Open Itinerary View for any trip
2. Click "Share" → get public URL
3. Toggle "Share to Community"
4. Open Community Tab
5. Find the post
6. Click it → Public Itinerary opens

EXPECTED: Public URL works without login, post appears in Community feed

---

FLOW D: Packing Checklist Reset
1. Open a trip → go to Packing Checklist
2. Add 5 items across 3 categories
3. Check off 3 items
4. Click "Reset Checklist"
5. All items unchecked (not deleted)

EXPECTED: Reset clears checkmarks, not the item list

---

FLOW E: Invoice Export
1. Open any trip's Expense Invoice
2. Add a new expense row
3. Verify totals recalculate
4. Click "Export as PDF"
5. Verify PDF downloads with correct data

EXPECTED: PDF includes all rows, totals, trip name, and date range
```

---

### STEP 4 — REPORTING FORMAT

For each issue found, report it in this format:

```
ISSUE #[N]
Screen: [Screen name and number]
Type: [Missing Feature / Visual Bug / Flow Bug / Consistency Issue]
Priority: [Critical / High / Medium / Low]
Description: [What is wrong or missing]
Expected: [What should happen or be present]
Screenshot: [Attach if possible]
Suggested Fix: [Brief implementation note]
```

---

### STEP 5 — FINAL SIGN-OFF CRITERIA

The frontend is ready for review when ALL of the following are true:

```
□ All 14 screens are implemented and reachable via navigation
□ No screen displays placeholder text (e.g. "Option and its details") in production
□ All 5 cross-screen flows (A through E) pass without errors
□ The global design system is consistent (same fonts, colors, components everywhere)
□ All critical priority issues from the gap table are resolved
□ Mobile viewport (375px width) works on all screens without horizontal scroll
□ Browser console shows zero errors on all screens
□ All buttons with async actions have a loading state
□ All destructive actions (Delete, Remove) have a confirmation dialog
□ Empty states are designed and visible for all list/feed screens
```

---

*Traveloop UI/UX Testing Prompt v1.0 — For use by QA testers, AI reviewers, and frontend developers*
