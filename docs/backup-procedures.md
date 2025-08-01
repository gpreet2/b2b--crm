# TryZore CRM Backup Procedures

## Overview
This document outlines the backup and recovery procedures for the TryZore CRM database. We use a multi-layered approach to ensure data safety and quick recovery.

## Backup Strategy

### 1. Supabase Automatic Backups (Pro Plan)
- **Frequency**: Daily at UTC midnight
- **Retention**: 7 days
- **Type**: Logical backups (pg_dump)
- **Recovery Point Objective (RPO)**: Up to 24 hours
- **Access**: Dashboard > Database > Backups > Scheduled backups

### 2. Point-in-Time Recovery (PITR) - Recommended
- **Frequency**: Continuous (WAL archiving every 2 minutes)
- **Retention**: Configurable (default 7 days)
- **Type**: Physical backups + WAL files
- **Recovery Point Objective (RPO)**: Up to 2 minutes
- **Cost**: $0.125 per hour ($93/month)
- **Enable**: Dashboard > Settings > Add-ons > PITR

### 3. Manual Backups
- **Purpose**: Additional safety layer for major deployments
- **Scripts**: Located in `/scripts` directory
- **Storage**: Local filesystem (configure cloud storage as needed)

## Manual Backup Procedures

### Creating a Backup

1. **Prerequisites**:
   - PostgreSQL client tools installed (`pg_dump`)
   - Database connection URL configured in `.env`

2. **Run the backup script**:
   ```bash
   cd /path/to/project
   ./scripts/backup-database.sh
   ```

3. **Verify backup**:
   - Check the `backups/` directory for the compressed file
   - Note the file size and timestamp

### Restoring from Backup

1. **List available backups**:
   ```bash
   ./scripts/restore-database.sh
   ```

2. **Restore specific backup**:
   ```bash
   ./scripts/restore-database.sh backups/tryzore_backup_20250131_120000.sql.gz
   ```

3. **Post-restore verification**:
   - Check row counts displayed after restore
   - Verify RLS policies are enabled
   - Test authentication and permissions
   - Run the application test suite

## Automated Backup Configuration

### Scheduling with Cron (Production)

Add to crontab for daily backups at 2 AM:
```bash
0 2 * * * cd /path/to/project && ./scripts/backup-database.sh >> /var/log/tryzore-backup.log 2>&1
```

### Cloud Storage Integration

For production environments, uncomment and configure cloud storage in the backup script:

**AWS S3**:
```bash
aws s3 cp "$BACKUP_FILE" "s3://your-backup-bucket/database-backups/" --profile your-profile
```

**Google Cloud Storage**:
```bash
gsutil cp "$BACKUP_FILE" "gs://your-backup-bucket/database-backups/"
```

## Recovery Scenarios

### Scenario 1: Accidental Data Deletion
- **With PITR**: Restore to point just before deletion
- **Without PITR**: Restore from most recent daily backup
- **Manual backup**: Use if deletion occurred after last automatic backup

### Scenario 2: Database Corruption
1. Stop application access immediately
2. Assess corruption extent using Supabase logs
3. Restore from PITR to last known good state
4. Verify data integrity post-restore

### Scenario 3: Complete Project Loss
1. Create new Supabase project
2. Restore schema from latest backup
3. Restore data using manual backup script
4. Reconfigure environment variables
5. Update application connection strings

## Best Practices

1. **Enable PITR for Production**
   - Provides best RPO (2 minutes)
   - Allows granular recovery
   - Worth the cost for production data

2. **Test Restore Procedures**
   - Monthly restore drills
   - Document recovery times
   - Verify data integrity

3. **Monitor Backup Health**
   - Check Supabase backup status daily
   - Monitor backup script logs
   - Alert on backup failures

4. **Secure Backup Storage**
   - Encrypt backup files at rest
   - Restrict access to backup storage
   - Use separate credentials for backup operations

5. **Documentation**
   - Keep this document updated
   - Document any custom procedures
   - Maintain recovery contact list

## Backup Monitoring Checklist

Daily:
- [ ] Verify Supabase automatic backup completed
- [ ] Check manual backup logs (if scheduled)
- [ ] Monitor database size growth

Weekly:
- [ ] Review backup retention policy
- [ ] Check available storage space
- [ ] Verify backup file integrity

Monthly:
- [ ] Perform test restore
- [ ] Review and update procedures
- [ ] Audit backup access logs

## Emergency Contacts

- **Supabase Support**: Dashboard > Support > New Ticket
- **Database Administrator**: [Your DBA contact]
- **DevOps Lead**: [Your DevOps contact]

## Related Documentation
- [Database Schema Documentation](./database-schema.md)
- [Disaster Recovery Plan](./disaster-recovery.md) (TODO)
- [Supabase Backup Documentation](https://supabase.com/docs/guides/platform/backups)