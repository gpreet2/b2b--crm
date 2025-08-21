// Simple test route to verify middleware execution
export async function GET() {
  return Response.json({
    message: 'Test route accessed',
    timestamp: new Date().toISOString(),
    headers: {
      'X-Test': 'middleware-test'
    }
  });
}