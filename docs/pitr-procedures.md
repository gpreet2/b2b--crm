# Point-in-Time Recovery (PITR) Procedures

## Overview
Point-in-Time Recovery (PITR) provides granular backup capabilities with Recovery Point Objective (RPO) of up to 2 minutes. This document outlines procedures for enabling, managing, and restoring from PITR backups.

## Enabling PITR

### Prerequisites
- Pro, Team, or Enterprise plan
- Understanding of the $0.125/hour cost ($93/month)

### Steps to Enable
1. Navigate to Dashboard > Settings > Add-ons
2. Click on "Point-in-Time Recovery"
3. Review the pricing information
4. Click "Enable PITR"
5. Confirm the action

### Verification
- Check Dashboard > Database > Backups > Point in time
- Verify earliest and latest recovery points are displayed
- Monitor backup status in the dashboard

## Understanding PITR

### How It Works
- **Physical Backups**: Daily snapshots of the database directory
- **WAL Archives**: Write-Ahead Log files archived every 2 minutes
- **Combination**: Physical backup + WAL replay = point-in-time recovery

### Key Metrics
- **RPO**: 2 minutes maximum data loss
- **Retention**: Configurable (default 7 days)
- **Storage**: WAL files stored in S3
- **Cost**: $0.125/hour when enabled

## Recovery Procedures

### 1. Determining Recovery Point

Before initiating recovery:
1. Identify the exact time of the incident
2. Check latest available recovery point in dashboard
3. Consider impact of data loss between incident and recovery point

### 2. Pre-Recovery Checklist

- [ ] Notify all stakeholders of planned downtime
- [ ] Document current database state
- [ ] Stop all application traffic
- [ ] Take manual backup if possible
- [ ] Record exact recovery timestamp needed

### 3. Initiating PITR Recovery

1. **Access PITR Dashboard**
   - Navigate to Database > Backups > Point in time
   - Click "Start a restore"

2. **Select Recovery Point**
   - Use date/time picker to select exact recovery point
   - Ensure selected time is within available recovery window
   - Note: Latest recovery point may be behind current time if DB is idle

3. **Confirm Recovery**
   - Review recovery details carefully
   - Acknowledge downtime requirements
   - Click confirm to start recovery

4. **Monitor Progress**
   - Recovery happens in two phases:
     - Physical backup restoration
     - WAL replay to reach target time
   - Monitor dashboard notifications
   - Do not attempt to access database during recovery

### 4. Post-Recovery Steps

1. **Verify Database State**
   ```sql
   -- Check recent transactions
   SELECT * FROM audit_logs 
   ORDER BY created_at DESC 
   LIMIT 100;
   
   -- Verify table row counts
   SELECT 
     schemaname,
     tablename,
     n_live_tup as row_count
   FROM pg_stat_user_tables
   ORDER BY n_live_tup DESC;
   ```

2. **Test Critical Functions**
   - Authentication workflows
   - RLS policies
   - Database functions and triggers
   - API endpoints

3. **Resume Operations**
   - Re-enable application access
   - Monitor for any issues
   - Communicate restoration complete

## Common Scenarios

### Scenario 1: Accidental Table Drop
**Time to Recover**: 15-30 minutes depending on database size

1. Identify exact time of DROP TABLE command
2. Stop all database access immediately
3. Initiate PITR to 1 minute before the drop
4. Verify table is restored with all data

### Scenario 2: Bad Migration
**Time to Recover**: 20-45 minutes

1. Note migration start time from audit logs
2. Review migration impact
3. Restore to point before migration started
4. Re-apply any valid changes lost

### Scenario 3: Data Corruption
**Time to Recover**: 30-60 minutes

1. Identify earliest signs of corruption
2. Analyze corruption pattern
3. Restore to last known good state
4. Implement checks to prevent recurrence

## Best Practices

### 1. Regular Testing
- Monthly PITR restore drills
- Document recovery times
- Test different scenarios
- Update procedures based on learnings

### 2. Monitoring
- Set up alerts for PITR status
- Monitor recovery point lag
- Track WAL generation rate
- Review storage costs

### 3. Documentation
- Log all recovery operations
- Document lessons learned
- Maintain recovery time records
- Update runbooks regularly

### 4. Recovery Planning
- Define RPO/RTO for each system
- Create scenario-specific runbooks
- Train team on procedures
- Maintain escalation contacts

## Limitations and Considerations

### 1. Downtime During Recovery
- Database is completely unavailable
- Duration depends on database size and activity
- Cannot be cancelled once started

### 2. Recovery Window
- Limited by retention period setting
- Cannot recover beyond earliest available point
- Latest point may lag during low activity

### 3. Cost Implications
- Continuous cost while enabled
- Storage costs for WAL files
- Consider disabling for non-production

### 4. Feature Limitations
- Cannot download physical backups
- Requires dashboard access for recovery
- No API for automated recovery (yet)

## Troubleshooting

### Issue: Latest recovery point is hours old
**Cause**: Low database activity
**Solution**: This is normal - no WAL files generated without changes

### Issue: Recovery taking longer than expected
**Cause**: Large database or high activity period
**Solution**: Monitor progress, typical times:
- Small DB (<1GB): 10-20 minutes
- Medium DB (1-10GB): 20-45 minutes  
- Large DB (>10GB): 45+ minutes

### Issue: Cannot enable PITR
**Cause**: Project requirements not met
**Solution**: Verify:
- On Pro plan or higher
- Database is on recent platform version
- No conflicting add-ons

## Emergency Contacts

- **Supabase Support**: Dashboard > Support (Pro plan)
- **Status Page**: https://status.supabase.com
- **Internal Escalation**: See disaster recovery plan

## Related Documentation
- [Backup Procedures](./backup-procedures.md)
- [Database Schema](./database-schema.md)
- [Supabase PITR Docs](https://supabase.com/docs/guides/platform/backups#point-in-time-recovery)