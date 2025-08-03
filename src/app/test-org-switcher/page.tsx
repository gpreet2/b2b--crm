"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useRouter } from "next/navigation";

interface Organization {
  id: string;
  name: string;
  role: string;
  isCurrent: boolean;
}

export default function TestOrgSwitcherPage() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrgId, setCurrentOrgId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [switchResult, setSwitchResult] = useState<any>(null);

  // Fetch user's organizations
  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await fetch("/api/auth/switch-organization");
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch organizations");
      }
      
      setOrganizations(data.organizations || []);
      setCurrentOrgId(data.currentOrganizationId || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch organizations");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Switch to a different organization
  const switchOrganization = async (orgId: string) => {
    try {
      setLoading(true);
      setError("");
      setSwitchResult(null);
      
      const response = await fetch("/api/auth/switch-organization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ organizationId: orgId }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to switch organization");
      }
      
      setSwitchResult(data);
      // Refresh the list to show updated current org
      await fetchOrganizations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to switch organization");
      console.error("Switch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface via-surface-light to-accent p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="p-8">
          <h1 className="text-2xl font-bold text-primary-text mb-6">
            Test Organization Switcher
          </h1>
          
          {error && (
            <div className="mb-4 p-4 bg-danger/10 border border-danger/20 rounded-lg">
              <p className="text-danger font-medium">Error: {error}</p>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="bg-info/10 border border-info/20 rounded-lg p-4">
              <p className="text-sm text-info">
                <strong>Current Organization ID:</strong> {currentOrgId || "None"}
              </p>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-primary-text">
                Your Organizations ({organizations.length})
              </h2>
              
              {loading && (
                <p className="text-secondary-text">Loading organizations...</p>
              )}
              
              {!loading && organizations.length === 0 && (
                <p className="text-secondary-text">
                  No organizations found. You may need to create an organization first.
                </p>
              )}
              
              {organizations.map((org) => (
                <div
                  key={org.id}
                  className={`p-4 rounded-lg border ${
                    org.isCurrent
                      ? "border-primary bg-primary/5"
                      : "border-border bg-surface"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-primary-text">
                        {org.name}
                      </h3>
                      <p className="text-sm text-secondary-text">
                        ID: {org.id} | Role: {org.role}
                      </p>
                    </div>
                    {!org.isCurrent && (
                      <Button
                        onClick={() => switchOrganization(org.id)}
                        disabled={loading}
                        size="sm"
                      >
                        Switch to this org
                      </Button>
                    )}
                    {org.isCurrent && (
                      <span className="text-sm text-primary font-medium">
                        ✓ Current
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {switchResult && (
              <div className="mt-6 p-4 bg-success/10 border border-success/20 rounded-lg">
                <h3 className="font-medium text-success mb-2">
                  Switch Successful!
                </h3>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(switchResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Test Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-secondary-text">
            <li>Make sure you're signed in first (go to /auth)</li>
            <li>This page will show your current organization</li>
            <li>If you have multiple organizations, you can switch between them</li>
            <li>The switch updates your WorkOS session cookie</li>
            <li>After switching, all API calls will use the new organization context</li>
          </ol>
        </Card>
        
        <div className="flex space-x-4">
          <Button onClick={() => fetchOrganizations()} disabled={loading}>
            Refresh Organizations
          </Button>
          <Button onClick={() => router.push("/dashboard")} variant="outline">
            Go to Dashboard
          </Button>
          <Button onClick={() => router.push("/auth")} variant="outline">
            Go to Auth
          </Button>
        </div>
      </div>
    </div>
  );
}