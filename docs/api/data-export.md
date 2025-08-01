# Data Export API Documentation

## Overview
The Data Export API provides secure endpoints for exporting organization data in various formats. All endpoints require admin or owner permissions.

## Authentication
All export endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. Export Full Organization Data
Export all data for an organization in JSON or ZIP format.

**Endpoint:** `GET /api/data-export/organizations/:orgId/export`

**Parameters:**
- `orgId` (path): Organization ID
- `format` (query): Export format - `json` (default) or `csv`

**Response (JSON):**
```json
{
  "organization": { ... },
  "users": [ ... ],
  "clients": [ ... ],
  "events": [ ... ],
  "memberships": [ ... ],
  "tags": [ ... ],
  "exported_at": "2025-01-31T12:00:00Z",
  "version": "1.0"
}
```

**Response (CSV):**
Returns a ZIP file containing separate CSV files for each data type.

### 2. Export Specific Data Type
Export a specific type of data for an organization.

**Endpoint:** `GET /api/data-export/organizations/:orgId/export/:dataType`

**Parameters:**
- `orgId` (path): Organization ID
- `dataType` (path): Data type to export (e.g., `clients`, `events`, `memberships`)
- `format` (query): Export format - `json` (default) or `csv`
- `startDate` (query): Filter by start date (ISO 8601)
- `endDate` (query): Filter by end date (ISO 8601)

**Example Request:**
```
GET /api/data-export/organizations/123/export/events?format=csv&startDate=2025-01-01
```

### 3. Export Audit Logs
Export audit logs with optional filters.

**Endpoint:** `GET /api/data-export/organizations/:orgId/export/audit-logs`

**Parameters:**
- `orgId` (path): Organization ID
- `startDate` (query): Filter by start date
- `endDate` (query): Filter by end date
- `userId` (query): Filter by user ID
- `action` (query): Filter by action type

**Response:**
```json
{
  "audit_logs": [
    {
      "id": "...",
      "action": "update",
      "table_name": "clients",
      "user_id": "...",
      "created_at": "...",
      "old_data": { ... },
      "new_data": { ... }
    }
  ],
  "count": 150,
  "filters": {
    "startDate": "2025-01-01",
    "endDate": "2025-01-31"
  }
}
```

### 4. GDPR Data Export
Export all data for a specific user (GDPR compliance).

**Endpoint:** `GET /api/data-export/organizations/:orgId/gdpr-export/:userId`

**Parameters:**
- `orgId` (path): Organization ID
- `userId` (path): User ID to export data for

**Response:**
Returns a comprehensive JSON file with all user data across the system.

### 5. Manual Backup Trigger
Trigger a manual database backup (super admin only).

**Endpoint:** `POST /api/backup/manual`

**Headers:**
- `X-Admin-Token`: Admin backup token

**Response:**
```json
{
  "message": "Backup job queued",
  "job_id": "backup-1706707200000",
  "estimated_time": "5-10 minutes"
}
```

## Error Responses

### 401 Unauthorized
```json
{
  "error": "No authorization header"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions for data export"
}
```

### 500 Internal Server Error
```json
{
  "error": "Export failed"
}
```

## Usage Examples

### JavaScript/TypeScript
```typescript
// Export organization data as JSON
const response = await fetch('/api/data-export/organizations/123/export', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const data = await response.json();

// Export events as CSV
const csvResponse = await fetch('/api/data-export/organizations/123/export/events?format=csv', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const blob = await csvResponse.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'events.csv';
a.click();
```

### cURL
```bash
# Export organization data
curl -H "Authorization: Bearer $TOKEN" \
  https://api.tryzore.com/data-export/organizations/123/export

# Export audit logs with filters
curl -H "Authorization: Bearer $TOKEN" \
  "https://api.tryzore.com/data-export/organizations/123/export/audit-logs?startDate=2025-01-01&action=create"

# GDPR export
curl -H "Authorization: Bearer $TOKEN" \
  https://api.tryzore.com/data-export/organizations/123/gdpr-export/user-456 \
  -o gdpr-export.json
```

## Rate Limits
- Export endpoints are rate-limited to 10 requests per hour per organization
- Large exports may be queued and processed asynchronously
- GDPR exports have a separate limit of 5 requests per day per user

## Best Practices

1. **Schedule Regular Exports**
   - Set up automated exports for compliance
   - Use date filters to export incremental data

2. **Handle Large Datasets**
   - Use pagination for very large datasets
   - Consider using streaming for real-time exports

3. **Security Considerations**
   - Encrypt exported files at rest
   - Use secure channels for file transfer
   - Implement audit logging for all exports

4. **Data Retention**
   - Delete exported files after processing
   - Comply with data retention policies
   - Document export activities

## Compliance Notes

### GDPR Compliance
- User data exports available within 30 days
- All personal data included in exports
- Automated deletion workflows supported

### HIPAA Compliance
- Audit trails for all data access
- Encrypted exports available
- Access controls enforced

### Data Portability
- Standard formats (JSON, CSV)
- Machine-readable exports
- Complete data sets included