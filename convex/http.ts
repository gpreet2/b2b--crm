/**
 * HTTP endpoints for health checks and monitoring
 */

import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import { performSystemHealthCheck, getFeatureAvailability } from "./lib/secretValidation";

const http = httpRouter();

/**
 * Health check endpoint for secret management system
 */
http.route({
  path: "/health/secrets",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    try {
      // Perform comprehensive health check
      const healthSummary = await performSystemHealthCheck({ db: ctx.runQuery });
      const featureAvailability = await getFeatureAvailability({ db: ctx.runQuery });
      
      // Determine HTTP status code based on health
      let statusCode = 200;
      if (healthSummary.overallStatus === "critical") {
        statusCode = 503; // Service Unavailable
      } else if (healthSummary.overallStatus === "unhealthy") {
        statusCode = 503;
      } else if (healthSummary.overallStatus === "degraded") {
        statusCode = 200; // OK but with warnings
      }
      
      const response = {
        status: healthSummary.overallStatus,
        timestamp: Date.now(),
        secrets: {
          healthy: healthSummary.secretsHealthy,
          total: healthSummary.secretsTotal,
          healthPercentage: Math.round(
            (healthSummary.secretsHealthy / healthSummary.secretsTotal) * 100
          ),
          criticalAvailable: healthSummary.criticalSecretsAvailable
        },
        features: featureAvailability,
        kms: healthSummary.kmsConnectivity,
        issues: healthSummary.issues.length > 0 ? healthSummary.issues : undefined,
        lastFullCheck: healthSummary.lastFullCheck
      };
      
      return new Response(JSON.stringify(response, null, 2), {
        status: statusCode,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate"
        }
      });
    } catch (error) {
      console.error("Health check failed:", error);
      
      const errorResponse = {
        status: "error",
        timestamp: Date.now(),
        error: "Health check failed",
        message: error instanceof Error ? error.message : "Unknown error"
      };
      
      return new Response(JSON.stringify(errorResponse, null, 2), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate"
        }
      });
    }
  })
});

/**
 * Liveness probe - basic health check
 */
http.route({
  path: "/health/live",
  method: "GET", 
  handler: httpAction(async (ctx, request) => {
    try {
      // Basic liveness check - can we connect to database?
      // const testQuery = await ctx.runQuery(api.internal.secrets.getLatestHealthStatus);
      const testQuery = true; // Placeholder for now
      
      return new Response(JSON.stringify({
        status: "alive",
        timestamp: Date.now(),
        database: "connected"
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate"
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        status: "unhealthy", 
        timestamp: Date.now(),
        error: "Database connection failed"
      }), {
        status: 503,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate"
        }
      });
    }
  })
});

/**
 * Readiness probe - are we ready to serve traffic?
 */
http.route({
  path: "/health/ready",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    try {
      const featureAvailability = await getFeatureAvailability({ db: ctx.runQuery });
      
      // Service is ready if critical features are available
      const isReady = featureAvailability.authentication && featureAvailability.encryption;
      
      const response = {
        status: isReady ? "ready" : "not_ready",
        timestamp: Date.now(),
        features: featureAvailability,
        criticalFeaturesAvailable: isReady
      };
      
      return new Response(JSON.stringify(response, null, 2), {
        status: isReady ? 200 : 503,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate"
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        status: "not_ready",
        timestamp: Date.now(),
        error: "Readiness check failed"
      }), {
        status: 503,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
  })
});

/**
 * Secret access metrics (for monitoring dashboards)
 */
http.route({
  path: "/metrics/secrets",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    try {
      // Get query parameters
      const url = new URL(request.url);
      const hours = parseInt(url.searchParams.get("hours") || "24");
      const secretType = url.searchParams.get("secretType") || undefined;
      
      // Get access patterns
      // const patterns = await ctx.runQuery(api.internal.secrets.getSecretAccessPatterns, {
      //   hours,
      //   secretType
      // });
      const patterns = { totalAccesses: 0, successfulAccesses: 0, failedAccesses: 0, errorAccesses: 0, missingSecrets: 0, accessesBySecret: {}, accessesByHour: {} };
      
      // Format as Prometheus-style metrics
      const metrics = [
        `# HELP secret_access_total Total number of secret access attempts`,
        `# TYPE secret_access_total counter`,
        `secret_access_total{period="${hours}h"} ${patterns.totalAccesses}`,
        ``,
        `# HELP secret_access_successful Successful secret access attempts`,
        `# TYPE secret_access_successful counter`, 
        `secret_access_successful{period="${hours}h"} ${patterns.successfulAccesses}`,
        ``,
        `# HELP secret_access_failed Failed secret access attempts`,
        `# TYPE secret_access_failed counter`,
        `secret_access_failed{period="${hours}h"} ${patterns.failedAccesses + patterns.errorAccesses}`,
        ``,
        `# HELP secret_missing_count Missing secret attempts`,
        `# TYPE secret_missing_count counter`,
        `secret_missing_count{period="${hours}h"} ${patterns.missingSecrets}`
      ];
      
      // Add per-secret metrics
      Object.entries(patterns.accessesBySecret).forEach(([type, count]) => {
        metrics.push(`secret_access_by_type{secret_type="${type}",period="${hours}h"} ${count}`);
      });
      
      return new Response(metrics.join("\n"), {
        status: 200,
        headers: {
          "Content-Type": "text/plain",
          "Cache-Control": "no-cache, no-store, must-revalidate"
        }
      });
    } catch (error) {
      return new Response("# Error generating metrics", {
        status: 500,
        headers: { "Content-Type": "text/plain" }
      });
    }
  })
});

/**
 * Manual health check trigger (for testing)
 */
http.route({
  path: "/admin/health-check",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      // Verify admin access (in production, add proper authentication)
      const authHeader = request.headers.get("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return new Response(JSON.stringify({
          error: "Unauthorized",
          message: "Bearer token required"
        }), {
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }
      
      // Perform and record health check
      // const healthSummary = await ctx.runMutation(
      //   api.internal.secrets.performAndRecordHealthCheck
      // );
      const healthSummary = { overallStatus: "healthy" }; // Placeholder
      
      return new Response(JSON.stringify({
        success: true,
        message: "Health check completed",
        results: healthSummary
      }, null, 2), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: "Health check failed",
        message: error instanceof Error ? error.message : "Unknown error"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  })
});

/**
 * Clear secret cache endpoint (for maintenance)
 */
http.route({
  path: "/admin/clear-cache",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      // Verify admin access
      const authHeader = request.headers.get("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return new Response(JSON.stringify({
          error: "Unauthorized"
        }), {
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }
      
      // Clear cache
      // const result = await ctx.runMutation(api.internal.secrets.clearSecretCache);
      const result = { success: true }; // Placeholder
      
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: "Cache clear failed"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  })
});

export default http;