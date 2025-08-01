# Database Restore Test Plan

## Overview
This document outlines the test plan for validating database backup and restore procedures. Regular testing ensures our recovery procedures work when needed.

## Test Schedule
- **Monthly**: Basic restore test in staging
- **Quarterly**: Full disaster recovery drill
- **Annually**: Cross-region recovery test

## Test Scenarios

### Scenario 1: Daily Backup Restore
**Objective**: Verify daily backup restoration works correctly

**Pre-Test Setup**:
1. Create test data markers
2. Document current state
3. Note exact timestamp

**Test Steps**:
1. Navigate to Dashboard > Database > Backups > Scheduled backups
2. Select most recent backup
3. Initiate restore to staging project
4. Monitor restoration progress
5. Verify data integrity

**Validation Checklist**:
- [ ] All tables restored
- [ ] RLS policies active
- [ ] Functions working
- [ ] Triggers operational
- [ ] Row counts match
- [ ] No data corruption

**Expected Duration**: 30-45 minutes

### Scenario 2: PITR Recovery Test
**Objective**: Validate point-in-time recovery to specific timestamp

**Pre-Test Setup**:
1. Insert test record with timestamp
2. Wait 5 minutes
3. Delete test record
4. Note deletion timestamp

**Test Steps**:
1. Access PITR dashboard
2. Select time between insert and delete
3. Initiate recovery
4. Verify test record exists
5. Confirm deletion not applied

**Validation Checklist**:
- [ ] Recovery to exact timestamp
- [ ] Test record present
- [ ] Subsequent changes absent
- [ ] Database consistency maintained
- [ ] All constraints valid

**Expected Duration**: 20-30 minutes

### Scenario 3: Manual Backup Restore
**Objective**: Test manual backup script restoration

**Test Steps**:
1. Run backup script:
   ```bash
   ./scripts/backup-database.sh
   ```
2. Create new test database
3. Run restore script:
   ```bash
   ./scripts/restore-database.sh backups/latest.sql.gz
   ```
4. Verify restoration

**Validation Checklist**:
- [ ] Backup created successfully
- [ ] Restore completes without errors
- [ ] Data integrity verified
- [ ] Performance acceptable

### Scenario 4: Data Export/Import Test
**Objective**: Validate API export endpoints

**Test Steps**:
1. Call export endpoint:
   ```bash
   curl -H "Authorization: Bearer $TOKEN" \
     /api/data-export/organizations/$ORG_ID/export
   ```
2. Verify export completeness
3. Test CSV format
4. Validate GDPR export

**Validation Checklist**:
- [ ] All data types included
- [ ] Formats correct
- [ ] No sensitive data exposed
- [ ] Performance acceptable

## Recovery Time Objectives (RTO)

### Target Recovery Times
| Scenario | Target RTO | Actual (Last Test) |
|----------|------------|-------------------|
| Daily Backup | < 1 hour | ___ minutes |
| PITR | < 30 minutes | ___ minutes |
| Manual Backup | < 45 minutes | ___ minutes |
| Data Export | < 15 minutes | ___ minutes |

## Test Execution Log

### Test Run Template
```
Date: ____________________
Tester: __________________
Environment: _____________
Scenario: ________________

Start Time: ______________
End Time: ________________
Total Duration: __________

Issues Encountered:
_________________________
_________________________

Resolution:
_________________________
_________________________

Result: PASS / FAIL
```

## Automated Test Script

```bash
#!/bin/bash
# restore-test.sh - Automated restore testing

set -euo pipefail

echo "=== TryZore CRM Restore Test ==="
echo "Date: $(date)"
echo ""

# Test 1: Verify backup exists
echo "Test 1: Checking for recent backups..."
if [ -f "./backups/*.sql.gz" ]; then
    echo "✅ Backup files found"
else
    echo "❌ No backup files found"
    exit 1
fi

# Test 2: Test backup script
echo "Test 2: Running backup script..."
if ./scripts/backup-database.sh; then
    echo "✅ Backup script successful"
else
    echo "❌ Backup script failed"
    exit 1
fi

# Test 3: Verify export endpoint
echo "Test 3: Testing export endpoint..."
if curl -f -H "Authorization: Bearer $TEST_TOKEN" \
    "http://localhost:3000/api/data-export/organizations/$TEST_ORG/export" \
    -o /tmp/export-test.json; then
    echo "✅ Export endpoint working"
else
    echo "❌ Export endpoint failed"
fi

echo ""
echo "=== Test Summary ==="
echo "All tests completed. Review results above."
```

## Post-Test Actions

### After Each Test
1. Document results in test log
2. Update actual RTO times
3. Note any issues or improvements
4. Update procedures if needed

### Monthly Review
1. Analyze test trends
2. Identify recurring issues
3. Update automation scripts
4. Review with team

### Quarterly Assessment
1. Full procedure review
2. Update documentation
3. Team training refresh
4. Tool evaluation

## Failure Scenarios

### Test Failure Response
1. **Immediate Actions**:
   - Document failure details
   - Identify root cause
   - Escalate to team lead

2. **Resolution Steps**:
   - Fix identified issues
   - Re-run failed tests
   - Validate fixes

3. **Prevention**:
   - Update procedures
   - Add monitoring
   - Enhance automation

## Success Criteria

### Test Pass Requirements
- All validation checklists complete
- RTO targets met
- No data loss or corruption
- All features functional
- Performance acceptable

### Continuous Improvement
- Track RTO trends
- Reduce manual steps
- Enhance automation
- Improve documentation

## Related Documentation
- [Backup Procedures](./backup-procedures.md)
- [PITR Procedures](./pitr-procedures.md)
- [Data Export API](./api/data-export.md)
- [Disaster Recovery Plan](./disaster-recovery.md)