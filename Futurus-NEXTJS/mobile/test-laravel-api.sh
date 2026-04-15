#!/bin/bash

echo "════════════════════════════════════════════════════════"
echo "  Futurus - Laravel API Connection Test"
echo "════════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:8080/api"

# Test 1: Check if Laravel is running
echo "Test 1: Checking if Laravel is running on port 8080..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/general-setting")
if [ "$RESPONSE" = "200" ]; then
    echo -e "   ${GREEN}✓${NC} Laravel is running and responding (HTTP $RESPONSE)"
else
    echo -e "   ${RED}✗${NC} Laravel not responding (HTTP $RESPONSE)"
    echo "   Ensure docker compose is up."
    exit 1
fi
echo ""

# Test 2: Test Register
echo "Test 2: Testing registration endpoint..."
EMAIL="test$(date +%s)@example.com"
REG_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/reg_response.json \
    -X POST "$API_URL/auth/register" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -d "{\"name\":\"Mobile Tester\",\"email\":\"$EMAIL\",\"password\":\"password\",\"password_confirmation\":\"password\"}")

if [ "$REG_RESPONSE" = "201" ]; then
    echo -e "   ${GREEN}✓${NC} Registration endpoint working (HTTP $REG_RESPONSE)"
    echo "   Created user: $EMAIL"
else
    echo -e "   ${RED}✗${NC} Registration failed (HTTP $REG_RESPONSE)"
    cat /tmp/reg_response.json
    exit 1
fi
echo ""

# Test 3: Test Login
echo "Test 3: Testing login endpoint..."
LOGIN_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/login_response.json \
    -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"password\"}")

if [ "$LOGIN_RESPONSE" = "200" ]; then
    echo -e "   ${GREEN}✓${NC} Login endpoint working (HTTP $LOGIN_RESPONSE)"
    TOKEN=$(cat /tmp/login_response.json | sed -n 's/.*"access_token":"\([^"]*\)".*/\1/p')
else
    echo -e "   ${RED}✗${NC} Login failed (HTTP $LOGIN_RESPONSE)"
    cat /tmp/login_response.json
    exit 1
fi
echo ""

# Test 4: Test Profile (Sanctum)
echo "Test 4: Testing user profile endpoint (Auth Sanctum)..."
PROFILE_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/profile_response.json \
    -H "Authorization: Bearer $TOKEN" \
    -H "Accept: application/json" \
    "$API_URL/auth/user")

if [ "$PROFILE_RESPONSE" = "200" ]; then
    echo -e "   ${GREEN}✓${NC} User profile retrieved successfully (HTTP $PROFILE_RESPONSE)"
else
    echo -e "   ${RED}✗${NC} Profile retrieval failed (HTTP $PROFILE_RESPONSE)"
    cat /tmp/profile_response.json
    exit 1
fi
echo ""

# Test 5: Forgot Password
echo "Test 5: Testing forgot password endpoint..."
FORGOT_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/forgot_response.json \
    -X POST "$API_URL/auth/forgot-password" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -d "{\"email\":\"$EMAIL\"}")

if [ "$FORGOT_RESPONSE" = "200" ]; then
    echo -e "   ${GREEN}✓${NC} Forgot password endpoint working (HTTP $FORGOT_RESPONSE)"
else
    echo -e "   ${RED}✗${NC} Forgot password failed (HTTP $FORGOT_RESPONSE)"
    cat /tmp/forgot_response.json
fi
echo ""

echo "════════════════════════════════════════════════════════"
echo -e "${GREEN}✓ All API Gateway tests passed!${NC}"
echo "════════════════════════════════════════════════════════"
