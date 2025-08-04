#!/bin/bash

# Test automation script with real data integration
# This script runs comprehensive tests using real Supabase, WorkOS, and Redis data
# Used in CI/CD pipeline to ensure production-grade testing

set -e  # Exit on any error

echo "🚀 Starting comprehensive test suite with real data integration..."
echo "=================================================="

# Check required environment variables
required_vars=("SUPABASE_URL" "SUPABASE_SERVICE_KEY" "WORKOS_API_KEY" "WORKOS_CLIENT_ID")
missing_vars=()

for var in "${required_vars[@]}"; do
  if [[ -z "${!var}" ]]; then
    missing_vars+=("$var")
  fi
done

if [[ ${#missing_vars[@]} -gt 0 ]]; then
  echo "❌ Missing required environment variables:"
  printf '  - %s\n' "${missing_vars[@]}"
  echo ""
  echo "💡 These variables are required for real data testing."
  echo "   Make sure they are set in your GitHub Secrets or .env file."
  exit 1
fi

echo "✅ Environment variables validated"

# Optional: Redis variables (warn if missing but don't fail)
if [[ -z "$UPSTASH_REDIS_REST_URL" || -z "$UPSTASH_REDIS_REST_TOKEN" ]]; then
  echo "⚠️  Warning: Redis environment variables not set. Rate limiting tests may be skipped."
fi

echo ""
echo "🧪 Test Plan:"
echo "  1. Unit tests (isolated functionality)"
echo "  2. Integration tests (real database, auth, APIs)"
echo "  3. Middleware tests (permissions, rate limiting, security)"
echo "  4. GDPR/CCPA compliance tests (real data export/deletion)"
echo "  5. Coverage analysis"
echo ""

# Step 1: Run unit tests first (fast feedback)
echo "1️⃣  Running unit tests..."
npm run test:unit
echo "✅ Unit tests completed"
echo ""

# Step 2: Run integration tests with real data
echo "2️⃣  Running integration tests with real data..."
npm run test:integration
echo "✅ Integration tests completed"
echo ""

# Step 3: Run comprehensive real data tests
echo "3️⃣  Running comprehensive real data tests..."
npm run test:real-data
echo "✅ Real data tests completed"
echo ""

# Step 4: Generate coverage report
echo "4️⃣  Generating coverage report..."
npm run test:coverage
echo "✅ Coverage report generated"
echo ""

# Step 5: Validate test results and coverage
echo "5️⃣  Validating test results..."

# Check if coverage meets threshold (Jest will fail if it doesn't)
if [[ $? -eq 0 ]]; then
  echo "✅ All tests passed and coverage thresholds met"
else
  echo "❌ Tests failed or coverage below threshold"
  exit 1
fi

echo ""
echo "🎉 All tests completed successfully!"
echo "=================================================="
echo "✅ Unit tests: PASSED"
echo "✅ Integration tests: PASSED" 
echo "✅ Real data tests: PASSED"
echo "✅ Coverage thresholds: MET"
echo ""
echo "🔒 Production-grade testing with real data verified!"