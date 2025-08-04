-- Create audit logs table for comprehensive security and compliance logging
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User and organization context
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    
    -- Action details
    action VARCHAR(100) NOT NULL, -- e.g., 'auth.login', 'data.create', 'user.delete'
    resource_type VARCHAR(50) NOT NULL, -- e.g., 'user', 'organization', 'client'
    resource_id VARCHAR(100), -- ID of the affected resource (flexible for different ID types)
    
    -- Request context
    ip_address INET,
    user_agent TEXT,
    request_id VARCHAR(100), -- For correlating with application logs
    session_id VARCHAR(100),
    
    -- Event details
    details JSONB DEFAULT '{}', -- Additional context and data
    status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failure', 'pending')),
    error_message TEXT, -- For failure cases
    risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    
    -- Timing
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_organization_id ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_id ON audit_logs(resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_risk_level ON audit_logs(risk_level);
CREATE INDEX IF NOT EXISTS idx_audit_logs_status ON audit_logs(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ip_address ON audit_logs(ip_address);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_timestamp ON audit_logs(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_timestamp ON audit_logs(organization_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_timestamp ON audit_logs(action, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_risk_timestamp ON audit_logs(risk_level, timestamp DESC) WHERE risk_level IN ('high', 'critical');

-- GIN index for JSONB details column for efficient JSON queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_details_gin ON audit_logs USING GIN(details);

-- Enable Row Level Security
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy for service role (full access)
CREATE POLICY "Service role can manage audit logs" ON audit_logs
    FOR ALL USING (auth.role() = 'service_role');

-- Policy for authenticated users to read their own audit logs
CREATE POLICY "Users can read their own audit logs" ON audit_logs
    FOR SELECT USING (auth.uid() = user_id);

-- Policy for organization admins to read organization audit logs
CREATE POLICY "Organization admins can read org audit logs" ON audit_logs
    FOR SELECT USING (
        organization_id IN (
            SELECT id FROM organizations 
            WHERE owner_id = auth.uid()
        )
    );

-- Function to automatically set updated timestamp
CREATE OR REPLACE FUNCTION update_audit_logs_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.created_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update timestamp
CREATE TRIGGER update_audit_logs_timestamp_trigger
    BEFORE UPDATE ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_audit_logs_timestamp();

-- View for high-risk audit events (for security monitoring)
CREATE OR REPLACE VIEW high_risk_audit_events AS
SELECT 
    id,
    user_id,
    organization_id,
    action,
    resource_type,
    resource_id,
    ip_address,
    user_agent,
    details,
    status,
    error_message,
    risk_level,
    timestamp,
    created_at
FROM audit_logs 
WHERE risk_level IN ('high', 'critical')
ORDER BY timestamp DESC;

-- View for failed authentication attempts (for security monitoring)
CREATE OR REPLACE VIEW failed_auth_attempts AS
SELECT 
    id,
    ip_address,
    user_agent,
    details ->> 'email' as attempted_email,
    (details ->> 'attempt_count')::integer as attempt_count,
    timestamp,
    created_at
FROM audit_logs 
WHERE action = 'auth.failed_login' 
  AND status = 'failure'
ORDER BY timestamp DESC;

-- View for data export activities (for compliance monitoring)
CREATE OR REPLACE VIEW data_export_activities AS
SELECT 
    id,
    user_id,
    organization_id,
    resource_type,
    details,
    ip_address,
    timestamp,
    created_at
FROM audit_logs 
WHERE action = 'data.export'
ORDER BY timestamp DESC;

-- Function to clean up old audit logs (for data retention)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(retention_days INTEGER DEFAULT 2555) -- ~7 years
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM audit_logs 
    WHERE timestamp < NOW() - INTERVAL '1 day' * retention_days;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log the cleanup operation
    INSERT INTO audit_logs (
        action,
        resource_type,
        details,
        status,
        risk_level
    ) VALUES (
        'system.maintenance',
        'system',
        jsonb_build_object(
            'operation', 'audit_log_cleanup',
            'deleted_count', deleted_count,
            'retention_days', retention_days
        ),
        'success',
        'low'
    );
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT SELECT, INSERT ON audit_logs TO authenticated;
GRANT SELECT ON high_risk_audit_events TO authenticated;
GRANT SELECT ON failed_auth_attempts TO authenticated;
GRANT SELECT ON data_export_activities TO authenticated;

-- Comments for documentation
COMMENT ON TABLE audit_logs IS 'Comprehensive audit log for security, compliance, and monitoring';
COMMENT ON COLUMN audit_logs.action IS 'Specific action taken (e.g., auth.login, data.create)';
COMMENT ON COLUMN audit_logs.resource_type IS 'Type of resource affected (e.g., user, organization)';
COMMENT ON COLUMN audit_logs.resource_id IS 'ID of the specific resource affected';
COMMENT ON COLUMN audit_logs.details IS 'Additional context and metadata as JSON';
COMMENT ON COLUMN audit_logs.risk_level IS 'Security risk level of the action';
COMMENT ON COLUMN audit_logs.status IS 'Success, failure, or pending status of the action';

COMMENT ON VIEW high_risk_audit_events IS 'Security monitoring view for high and critical risk events';
COMMENT ON VIEW failed_auth_attempts IS 'Security monitoring view for failed authentication attempts';
COMMENT ON VIEW data_export_activities IS 'Compliance monitoring view for data export activities';

COMMENT ON FUNCTION cleanup_old_audit_logs IS 'Maintenance function to clean up old audit logs based on retention policy';