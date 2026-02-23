#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:8000}"
EMAIL="${EMAIL:-admin@abastos.com}"
PASSWORD="${PASSWORD:-secret123}"

echo "== Sanctum check against: ${BASE_URL}"

status_code() {
  # usage: status_code METHOD URL [extra curl args...]
  local method="$1"
  local url="$2"
  shift 2
  curl -s -o /dev/null -w "%{http_code}" -X "$method" "$url" "$@"
}

body() {
  # usage: body METHOD URL [extra curl args...]
  local method="$1"
  local url="$2"
  shift 2
  curl -s -X "$method" "$url" "$@"
}

# 1) Protected route without token -> 401
code_no_token="$(status_code GET "${BASE_URL}/api/me" -H "Accept: application/json")"
if [[ "$code_no_token" != "401" ]]; then
  echo "FAIL: /api/me without token expected 401, got ${code_no_token}"
  exit 1
fi
echo "OK: /api/me without token -> 401"

# 2) Login -> 200 + token
login_response="$(body POST "${BASE_URL}/api/login" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}")"

token="$(printf '%s' "$login_response" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')"
if [[ -z "${token}" ]]; then
  echo "FAIL: login did not return token"
  echo "Response: ${login_response}"
  exit 1
fi
echo "OK: login returned token"

# 3) /api/me with valid token -> 200
code_me_valid="$(status_code GET "${BASE_URL}/api/me" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer ${token}")"
if [[ "$code_me_valid" != "200" ]]; then
  echo "FAIL: /api/me with valid token expected 200, got ${code_me_valid}"
  exit 1
fi
echo "OK: /api/me with valid token -> 200"

# 4) /api/me with invalid token -> 401
code_me_invalid="$(status_code GET "${BASE_URL}/api/me" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer invalid_token_test")"
if [[ "$code_me_invalid" != "401" ]]; then
  echo "FAIL: /api/me with invalid token expected 401, got ${code_me_invalid}"
  exit 1
fi
echo "OK: /api/me with invalid token -> 401"

# 5) logout with valid token -> 200
code_logout="$(status_code POST "${BASE_URL}/api/logout" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer ${token}")"
if [[ "$code_logout" != "200" ]]; then
  echo "FAIL: /api/logout expected 200, got ${code_logout}"
  exit 1
fi
echo "OK: /api/logout -> 200"

# 6) old token after logout -> 401
code_me_after_logout="$(status_code GET "${BASE_URL}/api/me" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer ${token}")"
if [[ "$code_me_after_logout" != "401" ]]; then
  echo "FAIL: old token after logout expected 401, got ${code_me_after_logout}"
  exit 1
fi
echo "OK: old token after logout -> 401"

echo "SUCCESS: Sanctum token flow is working."
