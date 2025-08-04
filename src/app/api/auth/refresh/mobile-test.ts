/* eslint-disable no-console */
/**
 * Mobile app simulation test for refresh token endpoint
 * This simulates how a mobile app would interact with our auth system
 * Run with: npx tsx src/app/api/auth/refresh/mobile-test.ts
 */

// Simulate mobile app storage
class MobileStorage {
  private readonly storage: Map<string, unknown> = new Map();

  save(key: string, value: unknown) {
    this.storage.set(key, value);
    console.warn(`📱 Saved to mobile storage: ${key}`);
  }

  get(key: string) {
    return this.storage.get(key);
  }

  remove(key: string) {
    this.storage.delete(key);
  }
}

// Simulate mobile app auth manager
class MobileAuthManager {
  private readonly storage = new MobileStorage();
  private readonly baseUrl = 'http://localhost:3000';

  async checkAuthStatus() {
    console.warn('\n📱 Mobile App: Checking auth status...');

    try {
      // Mobile apps would send cookies if they have them
      const response = await fetch(`${this.baseUrl}/api/auth/refresh`, {
        method: 'GET',
        credentials: 'include', // Important for cookie-based auth
      });

      const data = await response.json();
      console.warn('   Auth Status:', data);

      if (data.authenticated) {
        // Save user info locally
        this.storage.save('user', data.user);
        this.storage.save('organizationId', data.organizationId);
        this.storage.save('sessionExpiry', data.sessionExpiry);

        // Check if refresh needed
        if (data.needsRefresh) {
          console.warn('   ⚠️  Token expires soon, need to refresh');
          return { needsRefresh: true, ...data };
        }
      }

      return data;
    } catch (error) {
      console.error('   ❌ Error checking auth:', error);
      return { authenticated: false, error };
    }
  }

  async refreshToken(organizationId?: string) {
    console.log('\n📱 Mobile App: Refreshing token...');
    if (organizationId) {
      console.log(`   Switching to organization: ${organizationId}`);
    }

    try {
      const body: Record<string, string> = {};
      if (organizationId) {
        body.organizationId = organizationId;
      }

      const response = await fetch(`${this.baseUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      const data = await response.json();
      console.log('   Refresh Response:', {
        status: response.status,
        success: data.success,
        user: data.user?.email,
        organizationId: data.organizationId,
        sessionExpiry: data.sessionExpiry,
        refreshIn: data.refreshIn ? `${data.refreshIn / 1000 / 60} minutes` : undefined,
      });

      if (data.success) {
        // Update local storage
        this.storage.save('user', data.user);
        this.storage.save('organizationId', data.organizationId);
        this.storage.save('sessionExpiry', data.sessionExpiry);
        this.storage.save(
          'nextRefreshTime',
          new Date(Date.now() + (data.refreshIn ?? 0)).toISOString()
        );

        console.log('   ✅ Token refreshed successfully');
        console.log(
          `   📅 Next refresh scheduled for: ${this.storage.get('nextRefreshTime')}`
        );
      }

      return data;
    } catch (error) {
      console.log('   ❌ Error refreshing token:', error);
      return { success: false, error };
    }
  }

  async simulateApiCall(endpoint: string) {
    console.log(`\n📱 Mobile App: Making API call to ${endpoint}...`);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        credentials: 'include',
      });

      console.log(`   Response status: ${response.status}`);

      if (response.status === 401) {
        console.log('   ⚠️  Unauthorized - need to refresh token');
        const refreshResult = await this.refreshToken();

        if (refreshResult.success) {
          console.log('   🔄 Retrying API call after refresh...');
          const retryResponse = await fetch(`${this.baseUrl}${endpoint}`, {
            credentials: 'include',
          });
          console.log(`   Retry status: ${retryResponse.status}`);
          return retryResponse;
        }
      }

      return response;
    } catch (error) {
      console.log('   ❌ API call failed:', error);
      throw error;
    }
  }
}

// Run mobile app simulation
async function runMobileAppSimulation() {
  console.log('🧪 Mobile App Authentication Flow Simulation\n');
  console.log('This simulates how a mobile app would interact with our auth system');
  console.log('='.repeat(60));

  const mobileAuth = new MobileAuthManager();

  // Step 1: Check initial auth status (no auth)
  console.log('\n1️⃣ Initial app launch - checking auth status');
  const initialStatus = await mobileAuth.checkAuthStatus();
  console.log(
    `   Result: User is ${initialStatus.authenticated ? 'authenticated' : 'not authenticated'}`
  );

  // Step 2: Simulate user login flow
  console.log('\n2️⃣ User needs to login');
  console.log('   In real app: Would open WorkOS login in webview/browser');
  console.log('   After login: App receives cookies from webview');

  // Step 3: Try to refresh without valid session
  console.log('\n3️⃣ Attempting token refresh without valid session');
  const _refreshWithoutAuth = await mobileAuth.refreshToken();
  console.log(`   Expected: Should fail with 401`);

  // Step 4: Simulate authenticated API call
  console.log('\n4️⃣ Simulating authenticated API call');
  console.log('   Note: This will fail without actual authentication');
  await mobileAuth.simulateApiCall('/api/auth/user');

  // Step 5: Multi-organization scenario
  console.log('\n5️⃣ Multi-organization scenario');
  console.log('   User belongs to multiple gyms:');
  console.log("   - Gym A (org_123): Member's primary gym");
  console.log('   - Gym B (org_456): Member also has access here');
  console.log('   Mobile app can refresh token with specific org context:');
  await mobileAuth.refreshToken('org_456');

  console.log('\n📝 Mobile App Integration Summary:');
  console.log('✅ GET /api/auth/refresh - Check session status');
  console.log('✅ POST /api/auth/refresh - Refresh tokens');
  console.log('✅ Supports organization switching for multi-gym members');
  console.log('✅ Returns refresh timing for proactive token management');
  console.log('✅ Mobile apps should refresh tokens before expiry');
  console.log('\n🔧 Implementation Notes:');
  console.log('- Mobile apps must handle cookie storage from WorkOS auth');
  console.log('- Refresh tokens proactively based on refreshIn field');
  console.log('- Handle 401s by refreshing then retrying requests');
  console.log('- Organization context preserved across refreshes');
}

// Run the simulation
runMobileAppSimulation().catch(console.error);
