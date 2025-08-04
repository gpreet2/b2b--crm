-- Data Privacy and Compliance Tables for GDPR/CCPA
-- Migration: 003_data_privacy_tables
-- Created: 2025-08-04

-- Data Privacy Requests Table
CREATE TABLE IF NOT EXISTS data_privacy_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    request_type VARCHAR(20) NOT NULL CHECK (request_type IN ('access', 'portability', 'rectification', 'erasure', 'restriction', 'objection')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected', 'expired')),
    description TEXT,
    requested_data_types TEXT[], -- Array of table names requested
    legal_basis VARCHAR(10) NOT NULL DEFAULT 'gdpr' CHECK (legal_basis IN ('gdpr', 'ccpa', 'other')),
    requester_email VARCHAR(255) NOT NULL,
    requester_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    verification_expires_at TIMESTAMPTZ,
    fulfillment_deadline TIMESTAMPTZ NOT NULL,
    fulfilled_at TIMESTAMPTZ,
    fulfillment_data JSONB, -- Store fulfillment results and metadata
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Consent Management Table
CREATE TABLE IF NOT EXISTS user_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    consent_type VARCHAR(50) NOT NULL, -- 'marketing', 'analytics', 'third_party_sharing', etc.
    granted BOOLEAN NOT NULL DEFAULT FALSE,
    granted_at TIMESTAMPTZ,
    withdrawn_at TIMESTAMPTZ,
    consent_text TEXT, -- The actual consent text shown to user
    consent_version VARCHAR(10), -- Track consent text versions
    ip_address INET,
    user_agent TEXT,
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicate consent records
    UNIQUE(user_id, organization_id, consent_type)
);

-- Data Processing Activities Table (for compliance documentation)
CREATE TABLE IF NOT EXISTS data_processing_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    activity_name VARCHAR(255) NOT NULL,
    purpose TEXT NOT NULL, -- Purpose of processing
    legal_basis VARCHAR(50) NOT NULL, -- GDPR Article 6 basis
    data_categories TEXT[] NOT NULL, -- Types of personal data processed
    data_subjects TEXT[] NOT NULL, -- Categories of data subjects
    recipients TEXT[], -- Who receives the data
    third_country_transfers BOOLEAN DEFAULT FALSE,
    third_country_safeguards TEXT, -- Safeguards for international transfers
    retention_period VARCHAR(100), -- How long data is kept
    security_measures TEXT[], -- Technical and organizational measures
    data_sources TEXT[], -- Where the data comes from
    automated_decision_making BOOLEAN DEFAULT FALSE,
    profiling BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Data Retention Policies Table
CREATE TABLE IF NOT EXISTS data_retention_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    data_type VARCHAR(100) NOT NULL, -- Table name or data category
    retention_period_months INTEGER NOT NULL, -- Retention period in months
    retention_basis VARCHAR(100) NOT NULL, -- Legal basis for retention
    deletion_method VARCHAR(50) DEFAULT 'soft_delete', -- 'soft_delete', 'hard_delete', 'anonymize'
    auto_deletion_enabled BOOLEAN DEFAULT FALSE,
    exceptions TEXT[], -- Exceptions to the retention policy
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint for data type per organization
    UNIQUE(organization_id, data_type)
);

-- Data Breach Incidents Table (for GDPR Article 33/34 compliance)
CREATE TABLE IF NOT EXISTS data_breach_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    incident_ref VARCHAR(50) UNIQUE NOT NULL, -- Internal reference number
    discovered_at TIMESTAMPTZ NOT NULL,
    contained_at TIMESTAMPTZ,
    breach_type VARCHAR(50) NOT NULL, -- 'confidentiality', 'integrity', 'availability'
    affected_data_types TEXT[] NOT NULL,
    affected_individuals_count INTEGER,
    breach_cause TEXT NOT NULL,
    technical_measures TEXT,
    organizational_measures TEXT,
    likely_consequences TEXT,
    risk_level VARCHAR(10) CHECK (risk_level IN ('low', 'medium', 'high')),
    authority_notified BOOLEAN DEFAULT FALSE,
    authority_notification_date TIMESTAMPTZ,
    individuals_notified BOOLEAN DEFAULT FALSE,
    individuals_notification_date TIMESTAMPTZ,
    dpo_notified BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'investigating' CHECK (status IN ('investigating', 'contained', 'resolved', 'ongoing')),
    investigation_notes TEXT,
    remedial_actions TEXT[],
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_privacy_requests_user_org ON data_privacy_requests(user_id, organization_id);
CREATE INDEX IF NOT EXISTS idx_privacy_requests_status ON data_privacy_requests(status);
CREATE INDEX IF NOT EXISTS idx_privacy_requests_type ON data_privacy_requests(request_type);
CREATE INDEX IF NOT EXISTS idx_privacy_requests_deadline ON data_privacy_requests(fulfillment_deadline);

CREATE INDEX IF NOT EXISTS idx_user_consents_user_org ON user_consents(user_id, organization_id);
CREATE INDEX IF NOT EXISTS idx_user_consents_type ON user_consents(consent_type);
CREATE INDEX IF NOT EXISTS idx_user_consents_granted ON user_consents(granted);

CREATE INDEX IF NOT EXISTS idx_processing_activities_org ON data_processing_activities(organization_id);
CREATE INDEX IF NOT EXISTS idx_processing_activities_active ON data_processing_activities(is_active);

CREATE INDEX IF NOT EXISTS idx_retention_policies_org ON data_retention_policies(organization_id);
CREATE INDEX IF NOT EXISTS idx_retention_policies_type ON data_retention_policies(data_type);

CREATE INDEX IF NOT EXISTS idx_breach_incidents_org ON data_breach_incidents(organization_id);
CREATE INDEX IF NOT EXISTS idx_breach_incidents_discovered ON data_breach_incidents(discovered_at);
CREATE INDEX IF NOT EXISTS idx_breach_incidents_status ON data_breach_incidents(status);

-- Row Level Security (RLS) Policies
ALTER TABLE data_privacy_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_processing_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_retention_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_breach_incidents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for data_privacy_requests
CREATE POLICY privacy_requests_org_policy ON data_privacy_requests
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM user_organizations 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- RLS Policies for user_consents
CREATE POLICY user_consents_org_policy ON user_consents
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM user_organizations 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'coach')
        )
    );

-- RLS Policies for data_processing_activities
CREATE POLICY processing_activities_org_policy ON data_processing_activities
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM user_organizations 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- RLS Policies for data_retention_policies
CREATE POLICY retention_policies_org_policy ON data_retention_policies
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM user_organizations 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- RLS Policies for data_breach_incidents
CREATE POLICY breach_incidents_org_policy ON data_breach_incidents
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM user_organizations 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- Trigger functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers to all tables
CREATE TRIGGER update_privacy_requests_updated_at 
    BEFORE UPDATE ON data_privacy_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_consents_updated_at 
    BEFORE UPDATE ON user_consents 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_processing_activities_updated_at 
    BEFORE UPDATE ON data_processing_activities 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_retention_policies_updated_at 
    BEFORE UPDATE ON data_retention_policies 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_breach_incidents_updated_at 
    BEFORE UPDATE ON data_breach_incidents 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE data_privacy_requests IS 'GDPR/CCPA data subject requests tracking';
COMMENT ON TABLE user_consents IS 'User consent management for GDPR compliance';
COMMENT ON TABLE data_processing_activities IS 'Record of processing activities (GDPR Article 30)';
COMMENT ON TABLE data_retention_policies IS 'Data retention and deletion policies';
COMMENT ON TABLE data_breach_incidents IS 'Data breach incident tracking (GDPR Articles 33-34)';

-- Insert default data retention policies
INSERT INTO data_retention_policies (organization_id, data_type, retention_period_months, retention_basis, auto_deletion_enabled) 
SELECT 
    id,
    'user_data',
    84, -- 7 years
    'Legal obligation - tax and business records',
    false
FROM organizations
ON CONFLICT (organization_id, data_type) DO NOTHING;

INSERT INTO data_retention_policies (organization_id, data_type, retention_period_months, retention_basis, auto_deletion_enabled)
SELECT 
    id,
    'audit_logs',
    84, -- 7 years
    'Security and compliance monitoring',
    false
FROM organizations
ON CONFLICT (organization_id, data_type) DO NOTHING;

INSERT INTO data_retention_policies (organization_id, data_type, retention_period_months, retention_basis, auto_deletion_enabled)
SELECT 
    id,
    'marketing_data',
    24, -- 2 years
    'Consent-based marketing communications',
    true
FROM organizations
ON CONFLICT (organization_id, data_type) DO NOTHING;