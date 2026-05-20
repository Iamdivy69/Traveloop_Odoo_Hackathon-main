#!/usr/bin/env bash
# =============================================================================
# Traveloop Backend Smoke Test
# Usage: ./scripts/smoke-test.sh [BASE_URL]
# Default BASE_URL: http://localhost:3000/api/v1
# =============================================================================

set -euo pipefail

BASE_URL="${1:-http://localhost:3000/api/v1}"
START_TIME=$(date +%s)

# ── Colors ────────────────────────────────────────────────────────────────────
GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[0;33m"
CYAN="\033[0;36m"
BOLD="\033[1m"
RESET="\033[0m"

# ── Counters ──────────────────────────────────────────────────────────────────
PASSED=0
FAILED=0

# ── Test data ─────────────────────────────────────────────────────────────────
TEST_EMAIL="smoketest_$(date +%s)@traveloop.test"
TEST_PASSWORD="SmokeTest@123!"
TEST_FIRST="Smoke"
TEST_LAST="Tester"

TOKEN=""
TRIP_ID=""
STOP_ID=""
PACKING_ID=""

# ── Helpers ───────────────────────────────────────────────────────────────────
pass() {
  echo -e "${GREEN}  ✓ PASS${RESET} — $1"
  PASSED=$((PASSED + 1))
}

fail() {
  echo -e "${RED}  ✗ FAIL${RESET} — $1"
  FAILED=$((FAILED + 1))
}

step() {
  echo -e "\n${CYAN}${BOLD}[$((PASSED + FAILED + 1))] $1${RESET}"
}

# HTTP GET — returns body
get_body() {
  curl -s -H "Authorization: Bearer ${TOKEN}" "${BASE_URL}${1}"
}

# HTTP POST — returns body
post_body() {
  curl -s -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    -d "$2" \
    "${BASE_URL}${1}"
}

# HTTP GET — returns status code only
get_status() {
  curl -s -o /dev/null -w "%{http_code}" \
    -H "Authorization: Bearer ${TOKEN}" \
    "${BASE_URL}${1}"
}

# HTTP DELETE — returns status code only
delete_status() {
  curl -s -o /dev/null -w "%{http_code}" -X DELETE \
    -H "Authorization: Bearer ${TOKEN}" \
    "${BASE_URL}${1}"
}

# =============================================================================
# STEP 1 — Health check (poll until ready)
# =============================================================================
step "Waiting for API health check"
MAX_TRIES=20
TRIES=0
HEALTHY=false

while [ $TRIES -lt $MAX_TRIES ]; do
  TRIES=$((TRIES + 1))
  echo -e "  ${YELLOW}↻${RESET} Attempt $TRIES/$MAX_TRIES..."
  
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/health" 2>/dev/null || echo "000")
  BODY=$(curl -s "${BASE_URL}/health" 2>/dev/null || echo '{}')
  
  SUCCESS=$(echo "$BODY" | jq -r '.success // false' 2>/dev/null || echo "false")
  
  if [ "$HTTP_STATUS" = "200" ] && [ "$SUCCESS" = "true" ]; then
    HEALTHY=true
    break
  fi
  
  sleep 2
done

if $HEALTHY; then
  pass "Health endpoint returned { success: true } (after $TRIES attempt(s))"
else
  fail "API did not become healthy after $MAX_TRIES attempts — aborting"
  echo -e "\n${RED}${BOLD}Aborting smoke test — backend is not reachable.${RESET}"
  exit 1
fi

# =============================================================================
# STEP 2 — Register test user
# =============================================================================
step "Register test user (POST /auth/register)"
REGISTER_BODY=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "{
    \"first_name\": \"${TEST_FIRST}\",
    \"last_name\": \"${TEST_LAST}\",
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"${TEST_PASSWORD}\"
  }" \
  "${BASE_URL}/auth/register")

TOKEN=$(echo "$REGISTER_BODY" | jq -r '.data.token // empty' 2>/dev/null || echo "")

if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
  pass "Registered user '${TEST_EMAIL}', received JWT token"
else
  fail "Registration failed — no token returned"
  echo "  Response: $REGISTER_BODY"
  FAILED=$((FAILED + 1))
  TOKEN=""
fi

# =============================================================================
# STEP 3 — Login
# =============================================================================
step "Login (POST /auth/login)"
LOGIN_BODY=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"${TEST_EMAIL}\", \"password\": \"${TEST_PASSWORD}\"}" \
  "${BASE_URL}/auth/login")

LOGIN_TOKEN=$(echo "$LOGIN_BODY" | jq -r '.data.token // empty' 2>/dev/null || echo "")

if [ -n "$LOGIN_TOKEN" ] && [ "$LOGIN_TOKEN" != "null" ]; then
  TOKEN="$LOGIN_TOKEN"
  pass "Login successful, fresh token received"
else
  fail "Login failed — no token returned"
  echo "  Response: $LOGIN_BODY"
fi

# Abort remaining authenticated tests if we have no token
if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo -e "\n${RED}No valid token — skipping authenticated steps.${RESET}"
  FAILED=$((FAILED + 7))
else

# =============================================================================
# STEP 4 — Create a trip
# =============================================================================
step "Create trip (POST /trips)"
TRIP_BODY=$(post_body "/trips" "{
  \"name\": \"Smoke Test Trip\",
  \"description\": \"Automated test trip\",
  \"start_date\": \"$(date -u -d '+7 days' '+%Y-%m-%dT00:00:00Z' 2>/dev/null || date -u -v+7d '+%Y-%m-%dT00:00:00Z')\",
  \"end_date\": \"$(date -u -d '+14 days' '+%Y-%m-%dT00:00:00Z' 2>/dev/null || date -u -v+14d '+%Y-%m-%dT00:00:00Z')\",
  \"total_budget\": 2000
}")

TRIP_ID=$(echo "$TRIP_BODY" | jq -r '.data.id // empty' 2>/dev/null || echo "")

if [ -n "$TRIP_ID" ] && [ "$TRIP_ID" != "null" ]; then
  pass "Trip created with ID: ${TRIP_ID}"
else
  fail "Trip creation failed"
  echo "  Response: $TRIP_BODY"
fi

# =============================================================================
# STEP 5 — Search cities
# =============================================================================
step "Search cities (GET /cities?q=Paris)"
CITIES_BODY=$(get_body "/cities?q=Paris")
CITIES_STATUS=$(get_status "/cities?q=Paris")

CITIES_SUCCESS=$(echo "$CITIES_BODY" | jq -r '.success // false' 2>/dev/null || echo "false")
CITIES_TOTAL=$(echo "$CITIES_BODY" | jq -r '.data.total // .data.items | length // 0' 2>/dev/null || echo "0")

if [ "$CITIES_STATUS" = "200" ] && [ "$CITIES_SUCCESS" = "true" ]; then
  pass "City search returned HTTP 200 with success:true (total: ${CITIES_TOTAL})"
else
  fail "City search failed (HTTP ${CITIES_STATUS})"
  echo "  Response: $CITIES_BODY"
fi

# =============================================================================
# STEP 6 — Add a stop (requires a city, use first from search or skip gracefully)
# =============================================================================
step "Add stop to trip (POST /trips/:id/stops)"
if [ -n "$TRIP_ID" ] && [ "$TRIP_ID" != "null" ]; then
  # Try to get the first city id from the cities list
  FIRST_CITY_ID=$(get_body "/cities?limit=1" | jq -r '.data.items[0].id // empty' 2>/dev/null || echo "")
  
  if [ -z "$FIRST_CITY_ID" ] || [ "$FIRST_CITY_ID" = "null" ]; then
    fail "No cities found in database — cannot create stop (seed cities first)"
  else
    STOP_BODY=$(post_body "/trips/${TRIP_ID}/stops" "{
      \"city_id\": \"${FIRST_CITY_ID}\",
      \"arrival_date\": \"$(date -u -d '+7 days' '+%Y-%m-%dT00:00:00Z' 2>/dev/null || date -u -v+7d '+%Y-%m-%dT00:00:00Z')\",
      \"departure_date\": \"$(date -u -d '+10 days' '+%Y-%m-%dT00:00:00Z' 2>/dev/null || date -u -v+10d '+%Y-%m-%dT00:00:00Z')\",
      \"order_index\": 1
    }")
    
    STOP_ID=$(echo "$STOP_BODY" | jq -r '.data.id // empty' 2>/dev/null || echo "")
    
    if [ -n "$STOP_ID" ] && [ "$STOP_ID" != "null" ]; then
      pass "Stop created with ID: ${STOP_ID}"
    else
      fail "Stop creation failed"
      echo "  Response: $STOP_BODY"
    fi
  fi
else
  fail "Skipped — no valid TRIP_ID"
fi

# =============================================================================
# STEP 7 — Add a packing item
# =============================================================================
step "Add packing item (POST /trips/:id/packing)"
if [ -n "$TRIP_ID" ] && [ "$TRIP_ID" != "null" ]; then
  PACKING_BODY=$(post_body "/trips/${TRIP_ID}/packing" '{
    "name": "Smoke Test Passport",
    "category": "documents"
  }')
  
  PACKING_ID=$(echo "$PACKING_BODY" | jq -r '.data.id // empty' 2>/dev/null || echo "")
  
  if [ -n "$PACKING_ID" ] && [ "$PACKING_ID" != "null" ]; then
    pass "Packing item created with ID: ${PACKING_ID}"
  else
    fail "Packing item creation failed"
    echo "  Response: $PACKING_BODY"
  fi
else
  fail "Skipped — no valid TRIP_ID"
fi

# =============================================================================
# STEP 8 — Get full trip and verify structure
# =============================================================================
step "Fetch full trip (GET /trips/:id)"
if [ -n "$TRIP_ID" ] && [ "$TRIP_ID" != "null" ]; then
  FULL_TRIP_BODY=$(get_body "/trips/${TRIP_ID}")
  FULL_TRIP_SUCCESS=$(echo "$FULL_TRIP_BODY" | jq -r '.success // false' 2>/dev/null || echo "false")
  FULL_TRIP_NAME=$(echo "$FULL_TRIP_BODY" | jq -r '.data.name // empty' 2>/dev/null || echo "")
  
  if [ "$FULL_TRIP_SUCCESS" = "true" ] && [ "$FULL_TRIP_NAME" = "Smoke Test Trip" ]; then
    pass "Full trip returned with correct name '${FULL_TRIP_NAME}'"
  else
    fail "Full trip fetch failed or data mismatch"
    echo "  Response: $(echo "$FULL_TRIP_BODY" | head -c 500)"
  fi
else
  fail "Skipped — no valid TRIP_ID"
fi

# =============================================================================
# STEP 9 — Delete trip
# =============================================================================
step "Delete trip (DELETE /trips/:id)"
if [ -n "$TRIP_ID" ] && [ "$TRIP_ID" != "null" ]; then
  DELETE_STATUS=$(delete_status "/trips/${TRIP_ID}")
  
  if [ "$DELETE_STATUS" = "204" ]; then
    pass "Trip deleted (HTTP 204 No Content)"
  else
    fail "Trip deletion returned unexpected status: HTTP ${DELETE_STATUS}"
  fi
else
  fail "Skipped — no valid TRIP_ID"
fi

fi # end token guard

# =============================================================================
# SUMMARY
# =============================================================================
END_TIME=$(date +%s)
ELAPSED=$((END_TIME - START_TIME))
TOTAL=$((PASSED + FAILED))

echo -e "\n${BOLD}══════════════════════════════════════════${RESET}"
echo -e "${BOLD}  Traveloop Smoke Test Summary${RESET}"
echo -e "${BOLD}══════════════════════════════════════════${RESET}"
echo -e "  Total tests : ${BOLD}${TOTAL}${RESET}"
echo -e "  ${GREEN}${BOLD}Passed${RESET}      : ${GREEN}${BOLD}${PASSED}${RESET}"
echo -e "  ${RED}${BOLD}Failed${RESET}      : ${RED}${BOLD}${FAILED}${RESET}"
echo -e "  Time        : ${ELAPSED}s"
echo -e "${BOLD}══════════════════════════════════════════${RESET}\n"

if [ "$FAILED" -eq 0 ]; then
  echo -e "${GREEN}${BOLD}🎉 All tests passed! Backend is healthy.${RESET}\n"
  exit 0
else
  echo -e "${RED}${BOLD}⚠  ${FAILED} test(s) failed. Check logs above.${RESET}\n"
  exit 1
fi
