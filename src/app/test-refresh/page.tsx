"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function TestRefreshPage() {
  const [sessionStatus, setSessionStatus] = useState<any>(null);
  const [refreshResult, setRefreshResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Check session status
  const checkSession = async () => {
    try {
      setLoading(true);
      setError("");
      setRefreshResult(null);
      
      const response = await fetch("/api/auth/refresh", {
        method: "GET",
        credentials: "include",
      });
      
      const data = await response.json();
      setSessionStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check session");
    } finally {
      setLoading(false);
    }
  };

  // Refresh token
  const refreshToken = async (withOrgId?: string) => {
    try {
      setLoading(true);
      setError("");
      
      const body: any = {};
      if (withOrgId) {
        body.organizationId = withOrgId;
      }
      
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(body),
      });
      
      const data = await response.json();
      setRefreshResult(data);
      
      if (data.success) {
        // Re-check session after refresh
        await checkSession();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh token");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface via-surface-light to-accent p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="p-8">
          <h1 className="text-2xl font-bold text-primary-text mb-6">
            Test Refresh Token Endpoint
          </h1>
          
          <p className="text-secondary-text mb-6">
            This page tests the mobile app token refresh functionality.
          </p>
          
          {error && (
            <div className="mb-4 p-4 bg-danger/10 border border-danger/20 rounded-lg">
              <p className="text-danger font-medium">Error: {error}</p>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <Button 
                onClick={checkSession} 
                disabled={loading}
                variant="outline"
              >
                Check Session Status
              </Button>
              
              <Button 
                onClick={() => refreshToken()} 
                disabled={loading}
              >
                Refresh Token
              </Button>
              
              <Button 
                onClick={() => refreshToken("org_test123")} 
                disabled={loading}
                variant="outline"
              >
                Refresh with Org Switch
              </Button>
            </div>
            
            {sessionStatus && (
              <div className="mt-6 p-4 bg-info/10 border border-info/20 rounded-lg">
                <h3 className="font-medium text-info mb-2">Session Status:</h3>
                <pre className="text-xs overflow-auto whitespace-pre-wrap">
                  {JSON.stringify(sessionStatus, null, 2)}
                </pre>
              </div>
            )}
            
            {refreshResult && (
              <div className="mt-4 p-4 bg-success/10 border border-success/20 rounded-lg">
                <h3 className="font-medium text-success mb-2">Refresh Result:</h3>
                <pre className="text-xs overflow-auto whitespace-pre-wrap">
                  {JSON.stringify(refreshResult, null, 2)}
                </pre>
                {refreshResult.refreshIn && (
                  <p className="mt-2 text-sm text-success">
                    Next refresh recommended in: {Math.round(refreshResult.refreshIn / 1000 / 60)} minutes
                  </p>
                )}
              </div>
            )}
          </div>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Mobile App Integration Guide</h2>
          <div className="space-y-3 text-sm text-secondary-text">
            <div>
              <strong>1. Initial Authentication:</strong>
              <ul className="list-disc list-inside ml-4 mt-1">
                <li>Open WorkOS auth URL in webview/browser</li>
                <li>Capture cookies after successful login</li>
                <li>Store cookies for API requests</li>
              </ul>
            </div>
            
            <div>
              <strong>2. Session Management:</strong>
              <ul className="list-disc list-inside ml-4 mt-1">
                <li>GET /api/auth/refresh - Check if session is valid</li>
                <li>Monitor needsRefresh flag</li>
                <li>Refresh tokens before expiry</li>
              </ul>
            </div>
            
            <div>
              <strong>3. Token Refresh:</strong>
              <ul className="list-disc list-inside ml-4 mt-1">
                <li>POST /api/auth/refresh - Refresh the token</li>
                <li>Optional: Include organizationId to switch context</li>
                <li>Update stored session info with response</li>
              </ul>
            </div>
            
            <div>
              <strong>4. Multi-Gym Support:</strong>
              <ul className="list-disc list-inside ml-4 mt-1">
                <li>Users can belong to multiple gym organizations</li>
                <li>Switch context by refreshing with different organizationId</li>
                <li>All subsequent API calls use new organization context</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}