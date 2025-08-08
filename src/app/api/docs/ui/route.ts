/**
 * Swagger UI Route
 * 
 * GET /api/docs/ui - Serves interactive Swagger UI documentation
 * 
 * This endpoint serves the Swagger UI interface for interactive API documentation.
 * It includes custom styling and configuration for the TryZore API.
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/utils/logger';

/**
 * GET /api/docs/ui
 * Serves the Swagger UI HTML interface
 */
export async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || 'unknown';
  
  try {
    logger.info('Swagger UI request', { 
      requestId,
      userAgent: req.headers.get('user-agent'),
    });

    // Get the base URL for the API spec
    const baseUrl = req.nextUrl.origin;
    const specUrl = `${baseUrl}/api/docs`;

    // Swagger UI HTML with custom styling
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TryZore B2B CRM API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui.css" />
  <link rel="icon" type="image/png" href="https://unpkg.com/swagger-ui-dist@5.10.3/favicon-32x32.png" sizes="32x32" />
  <link rel="icon" type="image/png" href="https://unpkg.com/swagger-ui-dist@5.10.3/favicon-16x16.png" sizes="16x16" />
  <style>
    html {
      box-sizing: border-box;
      overflow: -moz-scrollbars-vertical;
      overflow-y: scroll;
    }
    *, *:before, *:after {
      box-sizing: inherit;
    }
    body {
      margin: 0;
      background: #fafafa;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
    }
    #swagger-ui {
      max-width: 1200px;
      margin: 0 auto;
    }
    .swagger-ui .topbar {
      background-color: #1f2937;
      border-bottom: 3px solid #3b82f6;
    }
    .swagger-ui .topbar .download-url-wrapper input[type=text] {
      border: 2px solid #3b82f6;
    }
    .swagger-ui .info .title {
      color: #1f2937;
    }
    .swagger-ui .scheme-container {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .custom-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem 0;
      text-align: center;
      margin-bottom: 2rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .custom-header h1 {
      margin: 0;
      font-size: 2.5rem;
      font-weight: 700;
    }
    .custom-header p {
      margin: 0.5rem 0 0 0;
      font-size: 1.1rem;
      opacity: 0.9;
    }
    .version-badge {
      display: inline-block;
      background: rgba(255, 255, 255, 0.2);
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }
    .swagger-ui .info {
      margin-bottom: 2rem;
    }
    .swagger-ui .info .description {
      color: #4b5563;
    }
  </style>
</head>
<body>
  <div class="custom-header">
    <h1>🏋️ TryZore B2B CRM API</h1>
    <p>Professional gym management system for fitness businesses</p>
    <div class="version-badge">v1.0.0</div>
  </div>
  <div id="swagger-ui"></div>

  <script src="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      // Initialize Swagger UI
      const ui = SwaggerUIBundle({
        url: '${specUrl}',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        defaultModelsExpandDepth: 2,
        defaultModelExpandDepth: 2,
        docExpansion: "list",
        filter: true,
        showCommonExtensions: true,
        showExtensions: true,
        tryItOutEnabled: true,
        requestInterceptor: function(request) {
          // Add custom headers or modify requests here if needed
          console.log('API Request:', request);
          return request;
        },
        responseInterceptor: function(response) {
          // Log responses for debugging
          console.log('API Response:', response);
          return response;
        },
        onComplete: function() {
          console.log('Swagger UI loaded successfully');
        },
        onFailure: function(error) {
          console.error('Swagger UI failed to load:', error);
        },
        validatorUrl: null, // Disable online validator
        supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
        oauth2RedirectUrl: undefined,
        showRequestHeaders: true,
        jsonEditor: false,
        defaultModelRendering: 'example',
      });

      // Custom styling and behavior
      setTimeout(function() {
        // Hide the top bar if desired (uncomment line below)
        // document.querySelector('.swagger-ui .topbar').style.display = 'none';
        
        // Add custom CSS classes
        document.querySelector('.swagger-ui').classList.add('custom-swagger-ui');
        
        // Add environment indicator
        const info = document.querySelector('.swagger-ui .info');
        if (info) {
          const envBadge = document.createElement('div');
          envBadge.innerHTML = '<strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}';
          envBadge.style.cssText = 'background: #f3f4f6; padding: 0.5rem 1rem; border-radius: 0.5rem; margin-top: 1rem; font-size: 0.875rem;';
          info.appendChild(envBadge);
        }
      }, 1000);
    };
  </script>
</body>
</html>`;

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
    
  } catch (error) {
    logger.error('Failed to serve Swagger UI', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      { error: 'Failed to serve API documentation' },
      { status: 500 }
    );
  }
}